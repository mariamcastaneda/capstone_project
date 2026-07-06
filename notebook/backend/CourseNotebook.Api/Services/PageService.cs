using Microsoft.EntityFrameworkCore;
using CourseNotebook.Api.Data;
using CourseNotebook.Api.Models;
using CourseNotebook.Api.Repositories;

namespace CourseNotebook.Api.Services;

public sealed class PageService
{
    private readonly IRepository<Page> _repo;
    private readonly AppDbContext _db;

    public PageService(IRepository<Page> repo, AppDbContext db)
    {
        _repo = repo;
        _db = db;
    }

    public async Task<IReadOnlyList<Page>> GetByNotebookAsync(string notebookId, CancellationToken ct = default)
        => await _db.Pages.AsNoTracking()
            .Where(p => p.NotebookId == notebookId)
            .OrderBy(p => p.SortOrder).ThenBy(p => p.CreatedAt)
            .ToListAsync(ct);

    public async Task<Page> CreateAsync(string notebookId, string name = "New Page", CancellationToken ct = default)
    {
        var page = new Page { NotebookId = notebookId, Name = name };
        await _repo.AddAsync(page, ct);
        await _repo.SaveChangesAsync(ct);
        return page;
    }

    public async Task<Page?> UpdateAsync(string id, string? name, int? sortOrder, CancellationToken ct = default)
    {
        var page = await _repo.GetByIdAsync(id, ct);
        if (page is null) return null;

        if (name is not null) page.Name = name;
        if (sortOrder.HasValue) page.SortOrder = sortOrder.Value;
        page.UpdatedAt = DateTime.UtcNow;

        await _repo.UpdateAsync(page, ct);
        await _repo.SaveChangesAsync(ct);
        return page;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var page = await _repo.GetByIdAsync(id, ct);
        if (page is null) return false;

        await _repo.DeleteAsync(page, ct);
        await _repo.SaveChangesAsync(ct);
        return true;
    }
}
