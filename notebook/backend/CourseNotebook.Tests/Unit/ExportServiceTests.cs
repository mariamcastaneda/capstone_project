using System.IO.Compression;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using FluentAssertions;
using CourseNotebook.Api.Data;
using CourseNotebook.Api.Models;
using CourseNotebook.Api.Services;

namespace CourseNotebook.Tests.Unit;

public class ExportServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly ExportService _svc;
    private readonly string _imageDir;

    public ExportServiceTests()
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
        _svc = new ExportService(_db, cfg);
    }

    [Fact]
    public async Task Export_ZipContainsNotebookJson()
    {
        var nb = await SeedNotebookAsync("Export Test");
        var bytes = await _svc.ExportNotebookAsync(nb.Id);
        using var zip = new ZipArchive(new MemoryStream(bytes));
        zip.GetEntry("notebook.json").Should().NotBeNull();
    }

    [Fact]
    public async Task Export_ZipContainsReferencedImageFile()
    {
        var nb   = await SeedNotebookAsync("NB");
        var page = _db.Pages.First(p => p.NotebookId == nb.Id);
        var img  = "test-img.png";
        await File.WriteAllBytesAsync(Path.Combine(_imageDir, img), new byte[] { 0x89, 0x50 });
        _db.CanvasElements.Add(new CanvasElement
        {
            Id = Guid.NewGuid().ToString(), PageId = page.Id,
            ElementType = "image", Data = $"{{\"fileName\":\"{img}\"}}"
        });
        await _db.SaveChangesAsync();

        var bytes = await _svc.ExportNotebookAsync(nb.Id);
        using var zip = new ZipArchive(new MemoryStream(bytes));
        zip.GetEntry($"images/{img}").Should().NotBeNull();
    }

    [Fact]
    public async Task Export_ThrowsKeyNotFound_ForMissingNotebook()
    {
        var act = async () => await _svc.ExportNotebookAsync(Guid.NewGuid().ToString());
        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    private async Task<Notebook> SeedNotebookAsync(string name)
    {
        var nb   = new Notebook { Id = Guid.NewGuid().ToString(), Name = name };
        var page = new Page { Id = Guid.NewGuid().ToString(), NotebookId = nb.Id, Name = "P1" };
        _db.Notebooks.Add(nb); _db.Pages.Add(page);
        await _db.SaveChangesAsync();
        return nb;
    }

    public void Dispose()
    {
        _db.Dispose();
        if (Directory.Exists(_imageDir)) Directory.Delete(_imageDir, true);
    }
}
