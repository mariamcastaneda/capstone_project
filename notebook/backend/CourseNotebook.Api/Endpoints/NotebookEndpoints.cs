using CourseNotebook.Api.Services;

namespace CourseNotebook.Api.Endpoints;

public static class NotebookEndpoints
{
    public static void MapNotebookEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/notebooks");

        group.MapGet("/", async (NotebookService svc, CancellationToken ct) =>
            Results.Ok(await svc.GetAllAsync(ct)));

        group.MapPost("/", async (CreateNotebookRequest req, NotebookService svc, CancellationToken ct) =>
        {
            var notebook = await svc.CreateAsync(req.Name, req.ColorTag ?? "#FF69B4", req.Icon, ct);
            return Results.Created($"/api/notebooks/{notebook.Id}", notebook);
        });

        group.MapPut("/{id}", async (string id, UpdateNotebookRequest req, NotebookService svc, CancellationToken ct) =>
        {
            var result = await svc.UpdateAsync(id, req.Name, req.ColorTag, req.Icon, req.SortOrder, ct);
            return result is null ? Results.NotFound() : Results.Ok(result);
        });

        group.MapDelete("/{id}", async (string id, NotebookService svc, CancellationToken ct) =>
        {
            var deleted = await svc.DeleteAsync(id, ct);
            return deleted ? Results.NoContent() : Results.NotFound();
        });

        group.MapGet("/{id}/export", async (string id, ExportService svc, CancellationToken ct) =>
        {
            var bytes = await svc.ExportNotebookAsync(id, ct);
            return Results.File(bytes, "application/zip", $"notebook-{id}.zip");
        });

        app.MapPost("/api/notebooks/import", async (IFormFile file, ImportService svc, CancellationToken ct) =>
        {
            using var stream = file.OpenReadStream();
            await svc.ImportAsync(stream, ct);
            return Results.Ok(new { message = "Notebook imported successfully." });
        }).DisableAntiforgery();
    }
}

record CreateNotebookRequest(string Name, string? ColorTag, string? Icon);
record UpdateNotebookRequest(string? Name, string? ColorTag, string? Icon, int? SortOrder);
