using Microsoft.EntityFrameworkCore;
using FluentAssertions;
using CourseNotebook.Api.Data;
using CourseNotebook.Api.Models;
using CourseNotebook.Api.Repositories;
using CourseNotebook.Api.Services;

namespace CourseNotebook.Tests.Unit;

public class NotebookServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly NotebookService _svc;

    public NotebookServiceTests()
    {
        var opts = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db  = new AppDbContext(opts);
        _svc = new NotebookService(new EfRepository<Notebook>(_db));
    }

    [Fact]
    public async Task CreateNotebook_PersistsWithCorrectName()
    {
        var nb = await _svc.CreateAsync("Data Structures");
        nb.Id.Should().NotBeNullOrEmpty();
        nb.Name.Should().Be("Data Structures");
        _db.Notebooks.Count().Should().Be(1);
    }

    [Fact]
    public async Task CreateNotebook_AllowsDuplicateNames()
    {
        await _svc.CreateAsync("Notes");
        await _svc.CreateAsync("Notes");
        _db.Notebooks.Count().Should().Be(2);
    }

    [Fact]
    public async Task UpdateNotebook_RenamesCorrectly()
    {
        var nb = await _svc.CreateAsync("Old Name");
        var updated = await _svc.UpdateAsync(nb.Id, "New Name", null, null, null);
        updated.Should().NotBeNull();
        updated!.Name.Should().Be("New Name");
    }

    [Fact]
    public async Task DeleteNotebook_RemovesFromDatabase()
    {
        var nb = await _svc.CreateAsync("To Delete");
        var result = await _svc.DeleteAsync(nb.Id);
        result.Should().BeTrue();
        _db.Notebooks.Count().Should().Be(0);
    }

    [Fact]
    public async Task DeleteNotebook_ReturnsFalse_WhenNotFound()
    {
        var result = await _svc.DeleteAsync(Guid.NewGuid().ToString());
        result.Should().BeFalse();
    }

    [Fact]
    public async Task GetAllAsync_ReturnsSortedBySortOrder()
    {
        var nb1 = await _svc.CreateAsync("C");
        var nb2 = await _svc.CreateAsync("A");
        await _svc.UpdateAsync(nb1.Id, null, null, null, 2);
        await _svc.UpdateAsync(nb2.Id, null, null, null, 0);
        var all = await _svc.GetAllAsync();
        all[0].Name.Should().Be("A");
        all[1].Name.Should().Be("C");
    }

    public void Dispose() => _db.Dispose();
}
