using System.IO.Compression;
using System.Text.Json;
using CourseNotebook.Api.Data;
using CourseNotebook.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CourseNotebook.Api.Services;

public sealed class ExportService
{
    private readonly AppDbContext _db;
    private readonly string _imagePath;

    public ExportService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _imagePath = Path.GetFullPath(config["ImageStoragePath"] ?? "data/images");
    }

    public async Task<byte[]> ExportNotebookAsync(string notebookId, CancellationToken ct = default)
    {
        var notebook = await _db.Notebooks.AsNoTracking().FirstOrDefaultAsync(n => n.Id == notebookId, ct)
            ?? throw new KeyNotFoundException($"Notebook {notebookId} not found.");

        var pages = await _db.Pages.AsNoTracking().Where(p => p.NotebookId == notebookId).ToListAsync(ct);
        var pageIds = pages.Select(p => p.Id).ToList();
        var elements = await _db.CanvasElements.AsNoTracking().Where(e => pageIds.Contains(e.PageId)).ToListAsync(ct);

        var imageFiles = elements
            .Where(e => e.ElementType is "image" or "sticker")
            .Select(e => ExtractFileName(e.Data))
            .Where(f => f is not null).Distinct().ToList();

        using var ms = new MemoryStream();
        using (var zip = new ZipArchive(ms, ZipArchiveMode.Create, leaveOpen: true))
        {
            var manifest = new { notebook, pages, elements };
            var json = JsonSerializer.Serialize(manifest, new JsonSerializerOptions { WriteIndented = true });
            var entry = zip.CreateEntry("notebook.json");
            using var writer = new StreamWriter(entry.Open());
            await writer.WriteAsync(json);

            foreach (var file in imageFiles)
            {
                var src = Path.Combine(_imagePath, file!);
                if (!File.Exists(src)) continue;
                zip.CreateEntryFromFile(src, $"images/{file}");
            }
        }

        return ms.ToArray();
    }

    private static string? ExtractFileName(string data)
    {
        try
        {
            var doc = JsonDocument.Parse(data);
            return doc.RootElement.TryGetProperty("fileName", out var v) ? v.GetString() : null;
        }
        catch { return null; }
    }
}
