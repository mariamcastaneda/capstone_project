using System.IO.Compression;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using FluentAssertions;
using CourseNotebook.Api.Data;
using CourseNotebook.Api.Models;
using CourseNotebook.Api.Services;

namespace CourseNotebook.Tests.Unit;

public class ImportServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly ImportService _svc;
    private readonly string _imageDir;

    public ImportServiceTests()
    {
        _imageDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(_imageDir);

        var opts = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(opts);

        var cfg = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["ImageStoragePath"] = _imageDir })
            .Build();
        _svc = new ImportService(_db, cfg);
    }

    [Fact]
    public async Task Import_RestoresNotebookPagesAndElements()
    {
        var zip = BuildValidZip(includeImage: false);
        await _svc.ImportAsync(new MemoryStream(zip));

        _db.Notebooks.Count().Should().Be(1);
        _db.Pages.Count().Should().Be(1);
        _db.CanvasElements.Count().Should().Be(1);
    }

    [Fact]
    public async Task Import_AssignsNewGuids_ToAvoidCollisions()
    {
        var zip = BuildValidZip();
        await _svc.ImportAsync(new MemoryStream(zip));
        var nb = _db.Notebooks.First();
        nb.Id.Should().NotBe("original-nb-id");
    }

    [Fact]
    public async Task Import_AllowsDuplicateNotebookNames()
    {
        _db.Notebooks.Add(new Notebook { Id = Guid.NewGuid().ToString(), Name = "Test NB" });
        await _db.SaveChangesAsync();

        var zip = BuildValidZip();
        await _svc.ImportAsync(new MemoryStream(zip));
        _db.Notebooks.Count().Should().Be(2);
    }

    [Fact]
    public async Task Import_ThrowsInvalidOperation_ForMissingManifest()
    {
        using var ms  = new MemoryStream();
        using var zip = new ZipArchive(ms, ZipArchiveMode.Create, leaveOpen: true);
        zip.Dispose();
        ms.Position = 0;
        var act = async () => await _svc.ImportAsync(ms);
        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*notebook.json*");
    }

    [Fact]
    public async Task Import_CopiesImageFiles_ToStoragePath()
    {
        var zip = BuildValidZip(includeImage: true);
        await _svc.ImportAsync(new MemoryStream(zip));
        Directory.GetFiles(_imageDir).Should().HaveCount(1);
    }

    private static byte[] BuildValidZip(bool includeImage = false)
    {
        var nbId   = "original-nb-id";
        var pageId = "original-page-id";
        var manifest = new
        {
            notebook = new { id = nbId, name = "Test NB", colorTag = "#FF69B4", sortOrder = 0 },
            pages    = new[] { new { id = pageId, notebookId = nbId, name = "Page 1", sortOrder = 0 } },
            elements = new[] { new { id = "el-1", pageId, elementType = "stroke", data = "{}", x = 0, y = 0, rotation = 0, zOrder = 0 } }
        };

        using var ms  = new MemoryStream();
        using var zip = new ZipArchive(ms, ZipArchiveMode.Create, leaveOpen: true);

        var entry = zip.CreateEntry("notebook.json");
        using (var w = new StreamWriter(entry.Open()))
            w.Write(JsonSerializer.Serialize(manifest));

        if (includeImage)
        {
            var img = zip.CreateEntry("images/sample.png");
            using var imgStream = img.Open();
            imgStream.Write(new byte[] { 0x89, 0x50, 0x4E, 0x47 });
        }

        zip.Dispose();
        return ms.ToArray();
    }

    public void Dispose()
    {
        _db.Dispose();
        if (Directory.Exists(_imageDir)) Directory.Delete(_imageDir, true);
    }
}
