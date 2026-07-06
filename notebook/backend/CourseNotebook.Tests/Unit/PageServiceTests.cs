using Microsoft.EntityFrameworkCore;
using FluentAssertions;
using CourseNotebook.Api.Data;
using CourseNotebook.Api.Models;
using CourseNotebook.Api.Repositories;
using CourseNotebook.Api.Services;

namespace CourseNotebook.Tests.Unit;

public class PageServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly PageService _svc;
    private readonly string _notebookId;

    public PageServiceTests()
    {
        var opts = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(opts);
        var nb = new Notebook { Id = Guid.NewGuid().ToString(), Name = "Test NB" };
        _db.Notebooks.Add(nb);
        _db.SaveChanges();
        _notebookId = nb.Id;
        _svc = new PageService(new EfRepository<Page>(_db), _db);
    }

    [Fact]
    public async Task CreatePage_AddsToNotebook()
    {
        var page = await _svc.CreateAsync(_notebookId, "Lecture 1");
        page.NotebookId.Should().Be(_notebookId);
        page.Name.Should().Be("Lecture 1");
    }

    [Fact]
    public async Task GetByNotebook_ReturnsOnlyPagesForThatNotebook()
    {
        await _svc.CreateAsync(_notebookId, "P1");
        await _svc.CreateAsync(_notebookId, "P2");
        var otherNb = new Notebook { Id = Guid.NewGuid().ToString(), Name = "Other" };
        _db.Notebooks.Add(otherNb); _db.SaveChanges();
        await _svc.CreateAsync(otherNb.Id, "Other Page");

        var pages = await _svc.GetByNotebookAsync(_notebookId);
        pages.Count.Should().Be(2);
    }

    [Fact]
    public async Task UpdatePage_RenamesCorrectly()
    {
        var page = await _svc.CreateAsync(_notebookId, "Old");
        var updated = await _svc.UpdateAsync(page.Id, "New", null);
        updated!.Name.Should().Be("New");
    }

    [Fact]
    public async Task DeletePage_RemovesFromDatabase()
    {
        var page = await _svc.CreateAsync(_notebookId, "Temp");
        var deleted = await _svc.DeleteAsync(page.Id);
        deleted.Should().BeTrue();
        _db.Pages.Count().Should().Be(0);
    }

    public void Dispose() => _db.Dispose();
}
