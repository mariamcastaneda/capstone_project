using Microsoft.EntityFrameworkCore;
using CourseNotebook.Api.Data;
using CourseNotebook.Api.Models;
using CourseNotebook.Api.Repositories;

namespace CourseNotebook.Api.Services;

public sealed class ElementService
{
    private readonly IRepository<CanvasElement> _repo;
    private readonly AppDbContext _db;

    public ElementService(IRepository<CanvasElement> repo, AppDbContext db)
    {
        _repo = repo;
        _db = db;
    }

    public async Task<IReadOnlyList<CanvasElement>> GetByPageAsync(string pageId, CancellationToken ct = default)
        => await _db.CanvasElements.AsNoTracking()
            .Where(e => e.PageId == pageId)
            .OrderBy(e => e.ZOrder).ThenBy(e => e.CreatedAt)
            .ToListAsync(ct);

    public async Task<CanvasElement> CreateAsync(string pageId, string elementType, string data,
        double x, double y, double? width, double? height, double rotation, int zOrder, CancellationToken ct = default)
    {
        var el = new CanvasElement
        {
            PageId = pageId, ElementType = elementType, Data = data,
            X = x, Y = y, Width = width, Height = height,
            Rotation = rotation, ZOrder = zOrder
        };
        await _repo.AddAsync(el, ct);
        await _repo.SaveChangesAsync(ct);
        return el;
    }

    public async Task<CanvasElement?> UpdateAsync(string id, string? data, double? x, double? y,
        double? width, double? height, double? rotation, int? zOrder, CancellationToken ct = default)
    {
        var el = await _repo.GetByIdAsync(id, ct);
        if (el is null) return null;

        if (data is not null) el.Data = data;
        if (x.HasValue) el.X = x.Value;
        if (y.HasValue) el.Y = y.Value;
        if (width.HasValue) el.Width = width.Value;
        if (height.HasValue) el.Height = height.Value;
        if (rotation.HasValue) el.Rotation = rotation.Value;
        if (zOrder.HasValue) el.ZOrder = zOrder.Value;
        el.UpdatedAt = DateTime.UtcNow;

        await _repo.UpdateAsync(el, ct);
        await _repo.SaveChangesAsync(ct);
        return el;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var el = await _repo.GetByIdAsync(id, ct);
        if (el is null) return false;

        await _repo.DeleteAsync(el, ct);
        await _repo.SaveChangesAsync(ct);
        return true;
    }

    public async Task DeleteByPageAsync(string pageId, CancellationToken ct = default)
    {
        var elements = await _db.CanvasElements.Where(e => e.PageId == pageId).ToListAsync(ct);
        _db.CanvasElements.RemoveRange(elements);
        await _db.SaveChangesAsync(ct);
    }
}
