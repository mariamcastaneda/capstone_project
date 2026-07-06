using CourseNotebook.Api.Services;

namespace CourseNotebook.Api.Endpoints;

public static class PageEndpoints
{
    public static void MapPageEndpoints(this WebApplication app)
    {
        app.MapGet("/api/notebooks/{notebookId}/pages", async (string notebookId, PageService svc, CancellationToken ct) =>
            Results.Ok(await svc.GetByNotebookAsync(notebookId, ct)));

        app.MapPost("/api/notebooks/{notebookId}/pages", async (string notebookId, CreatePageRequest req, PageService svc, CancellationToken ct) =>
        {
            var page = await svc.CreateAsync(notebookId, req.Name ?? "New Page", ct);
            return Results.Created($"/api/pages/{page.Id}", page);
        });

        app.MapPut("/api/pages/{id}", async (string id, UpdatePageRequest req, PageService svc, CancellationToken ct) =>
        {
            var result = await svc.UpdateAsync(id, req.Name, req.SortOrder, ct);
            return result is null ? Results.NotFound() : Results.Ok(result);
        });

        app.MapDelete("/api/pages/{id}", async (string id, PageService svc, CancellationToken ct) =>
        {
            var deleted = await svc.DeleteAsync(id, ct);
            return deleted ? Results.NoContent() : Results.NotFound();
        });
    }
}

record CreatePageRequest(string? Name);
record UpdatePageRequest(string? Name, int? SortOrder);
