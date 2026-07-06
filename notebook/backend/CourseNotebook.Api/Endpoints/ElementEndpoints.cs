using CourseNotebook.Api.Services;

namespace CourseNotebook.Api.Endpoints;

public static class ElementEndpoints
{
    public static void MapElementEndpoints(this WebApplication app)
    {
        app.MapGet("/api/pages/{pageId}/elements", async (string pageId, ElementService svc, CancellationToken ct) =>
            Results.Ok(await svc.GetByPageAsync(pageId, ct)));

        app.MapPost("/api/pages/{pageId}/elements", async (string pageId, CreateElementRequest req, ElementService svc, CancellationToken ct) =>
        {
            var el = await svc.CreateAsync(pageId, req.ElementType, req.Data, req.X, req.Y,
                req.Width, req.Height, req.Rotation ?? 0, req.ZOrder ?? 0, ct);
            return Results.Created($"/api/elements/{el.Id}", el);
        });

        app.MapPut("/api/elements/{id}", async (string id, UpdateElementRequest req, ElementService svc, CancellationToken ct) =>
        {
            var result = await svc.UpdateAsync(id, req.Data, req.X, req.Y,
                req.Width, req.Height, req.Rotation, req.ZOrder, ct);
            return result is null ? Results.NotFound() : Results.Ok(result);
        });

        app.MapDelete("/api/elements/{id}", async (string id, ElementService svc, CancellationToken ct) =>
        {
            var deleted = await svc.DeleteAsync(id, ct);
            return deleted ? Results.NoContent() : Results.NotFound();
        });

        app.MapDelete("/api/pages/{pageId}/elements", async (string pageId, ElementService svc, CancellationToken ct) =>
        {
            await svc.DeleteByPageAsync(pageId, ct);
            return Results.NoContent();
        });
    }
}

record CreateElementRequest(string ElementType, string Data, double X, double Y,
    double? Width, double? Height, double? Rotation, int? ZOrder);

record UpdateElementRequest(string? Data, double? X, double? Y,
    double? Width, double? Height, double? Rotation, int? ZOrder);
