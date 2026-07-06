using CourseNotebook.Api.Models;
using CourseNotebook.Api.Repositories;

namespace CourseNotebook.Api.Services;

public sealed class NotebookService
{
    private readonly IRepository<Notebook> _repo;

    public NotebookService(IRepository<Notebook> repo) => _repo = repo;

    public async Task<IReadOnlyList<Notebook>> GetAllAsync(CancellationToken ct = default)
    {
        var all = await _repo.GetAllAsync(ct);
        return all.OrderBy(n => n.SortOrder).ThenBy(n => n.CreatedAt).ToList();
    }

    public async Task<Notebook> CreateAsync(string name, string colorTag = "#FF69B4", string? icon = null, CancellationToken ct = default)
    {
        var notebook = new Notebook { Name = name, ColorTag = colorTag, Icon = icon };
        await _repo.AddAsync(notebook, ct);
        await _repo.SaveChangesAsync(ct);
        return notebook;
    }

    public async Task<Notebook?> UpdateAsync(string id, string? name, string? colorTag, string? icon, int? sortOrder, CancellationToken ct = default)
    {
        var notebook = await _repo.GetByIdAsync(id, ct);
        if (notebook is null) return null;

        if (name is not null) notebook.Name = name;
        if (colorTag is not null) notebook.ColorTag = colorTag;
        if (icon is not null) notebook.Icon = icon;
        if (sortOrder.HasValue) notebook.SortOrder = sortOrder.Value;
        notebook.UpdatedAt = DateTime.UtcNow;

        await _repo.UpdateAsync(notebook, ct);
        await _repo.SaveChangesAsync(ct);
        return notebook;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var notebook = await _repo.GetByIdAsync(id, ct);
        if (notebook is null) return false;

        await _repo.DeleteAsync(notebook, ct);
        await _repo.SaveChangesAsync(ct);
        return true;
    }
}
