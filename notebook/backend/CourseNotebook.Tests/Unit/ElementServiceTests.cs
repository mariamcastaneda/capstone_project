using Microsoft.EntityFrameworkCore;
using FluentAssertions;
using CourseNotebook.Api.Data;
using CourseNotebook.Api.Models;
using CourseNotebook.Api.Repositories;
using CourseNotebook.Api.Services;

namespace CourseNotebook.Tests.Unit;

public class ElementServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly ElementService _svc;
    private readonly string _pageId;

    public ElementServiceTests()
    {
        var opts = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(opts);
        var nb   = new Notebook { Id = Guid.NewGuid().ToString(), Name = "NB" };
        var page = new Page { Id = Guid.NewGuid().ToString(), NotebookId = nb.Id, Name = "P1" };
        _db.Notebooks.Add(nb); _db.Pages.Add(page); _db.SaveChanges();
        _pageId = page.Id;
        _svc = new ElementService(new EfRepository<CanvasElement>(_db), _db);
    }

    [Fact]
    public async Task CreateElement_PersistsWithCorrectType()
    {
        var el = await _svc.CreateAsync(_pageId, "stroke", "{}", 10, 20, null, null, 0, 0);
        el.ElementType.Should().Be("stroke");
        el.PageId.Should().Be(_pageId);
    }

    [Fact]
    public async Task GetByPage_ReturnsAllElementsForPage()
    {
        await _svc.CreateAsync(_pageId, "stroke", "{}", 0, 0, null, null, 0, 0);
        await _svc.CreateAsync(_pageId, "text",   "{}", 0, 0, null, null, 0, 1);
        var elements = await _svc.GetByPageAsync(_pageId);
        elements.Count.Should().Be(2);
    }

    [Fact]
    public async Task UpdateElement_ChangesDataField()
    {
        var el = await _svc.CreateAsync(_pageId, "text", "{\"content\":\"A\"}", 0, 0, null, null, 0, 0);
        var updated = await _svc.UpdateAsync(el.Id, "{\"content\":\"B\"}", null, null, null, null, null, null);
        updated!.Data.Should().Be("{\"content\":\"B\"}");
    }

    [Fact]
    public async Task DeleteElement_RemovesSingleElement()
    {
        var el = await _svc.CreateAsync(_pageId, "stroke", "{}", 0, 0, null, null, 0, 0);
        var result = await _svc.DeleteAsync(el.Id);
        result.Should().BeTrue();
        _db.CanvasElements.Count().Should().Be(0);
    }

    [Fact]
    public async Task DeleteByPage_RemovesAllElementsForPage()
    {
        await _svc.CreateAsync(_pageId, "stroke", "{}", 0, 0, null, null, 0, 0);
        await _svc.CreateAsync(_pageId, "text",   "{}", 0, 0, null, null, 0, 1);
        await _svc.DeleteByPageAsync(_pageId);
        _db.CanvasElements.Count().Should().Be(0);
    }

    public void Dispose() => _db.Dispose();
}
