using System.IO.Compression;
using System.Text.Json;
using CourseNotebook.Api.Data;
using CourseNotebook.Api.Models;

namespace CourseNotebook.Api.Services;

public sealed class ImportService
{
    private readonly AppDbContext _db;
    private readonly string _imagePath;

    public ImportService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _imagePath = Path.GetFullPath(config["ImageStoragePath"] ?? "data/images");
    }

    public async Task ImportAsync(Stream zipStream, CancellationToken ct = default)
    {
        using var zip = new ZipArchive(zipStream, ZipArchiveMode.Read, leaveOpen: false);
        var manifestEntry = zip.GetEntry("notebook.json")
            ?? throw new InvalidOperationException("Invalid ZIP: missing notebook.json.");

        using var reader = new StreamReader(manifestEntry.Open());
        var json = await reader.ReadToEndAsync(ct);
        var doc = JsonDocument.Parse(json).RootElement;

        var notebook = DeserializeNotebook(doc.GetProperty("notebook"));
        notebook.Id = Guid.NewGuid().ToString(); // avoid ID collision

        var pages = doc.GetProperty("pages").EnumerateArray()
            .Select(p => DeserializePage(p, notebook.Id)).ToList();

        var idMap = pages.ToDictionary(p => p.Item1, p => p.Item2.Id);
        var pageEntities = pages.Select(p => p.Item2).ToList();

        var elements = doc.GetProperty("elements").EnumerateArray()
            .Select(e => DeserializeElement(e, idMap)).Where(e => e is not null).ToList();

        Directory.CreateDirectory(_imagePath);
        foreach (var entry in zip.Entries.Where(e => e.FullName.StartsWith("images/")))
        {
            var fileName = Path.GetFileName(entry.FullName);
            var dest = Path.Combine(_imagePath, fileName);
            entry.ExtractToFile(dest, overwrite: true);
        }

        _db.Notebooks.Add(notebook);
        _db.Pages.AddRange(pageEntities);
        _db.CanvasElements.AddRange(elements!);
        await _db.SaveChangesAsync(ct);
    }

    private static Notebook DeserializeNotebook(JsonElement el) => new()
    {
        Id = el.GetProperty("id").GetString()!,
        Name = el.GetProperty("name").GetString()!,
        ColorTag = el.TryGetProperty("colorTag", out var ct) ? ct.GetString()! : "#FF69B4",
        SortOrder = el.TryGetProperty("sortOrder", out var so) ? so.GetInt32() : 0,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    private static (string OldId, Page Entity) DeserializePage(JsonElement el, string notebookId)
    {
        var oldId = el.GetProperty("id").GetString()!;
        var page = new Page
        {
            Id = Guid.NewGuid().ToString(),
            NotebookId = notebookId,
            Name = el.GetProperty("name").GetString()!,
            SortOrder = el.TryGetProperty("sortOrder", out var so) ? so.GetInt32() : 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        return (oldId, page);
    }

    private static CanvasElement? DeserializeElement(JsonElement el, Dictionary<string, string> pageIdMap)
    {
        var oldPageId = el.GetProperty("pageId").GetString()!;
        if (!pageIdMap.TryGetValue(oldPageId, out var newPageId)) return null;

        return new CanvasElement
        {
            Id = Guid.NewGuid().ToString(),
            PageId = newPageId,
            ElementType = el.GetProperty("elementType").GetString()!,
            Data = el.GetProperty("data").GetString()!,
            X = el.TryGetProperty("x", out var x) ? x.GetDouble() : 0,
            Y = el.TryGetProperty("y", out var y) ? y.GetDouble() : 0,
            Rotation = el.TryGetProperty("rotation", out var r) ? r.GetDouble() : 0,
            ZOrder = el.TryGetProperty("zOrder", out var z) ? z.GetInt32() : 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }
}
