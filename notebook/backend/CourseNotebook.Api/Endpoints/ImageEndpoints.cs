using CourseNotebook.Api.Services;

namespace CourseNotebook.Api.Endpoints;

public static class ImageEndpoints
{
    public static void MapImageEndpoints(this WebApplication app)
    {
        app.MapPost("/api/images/upload", async (IFormFile file, ImageService svc, CancellationToken ct) =>
        {
            try
            {
                var fileName = await svc.SaveAsync(file, ct);
                return Results.Ok(new { fileName });
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        }).DisableAntiforgery();

        app.MapDelete("/api/images/{fileName}", (string fileName, ImageService svc) =>
        {
            svc.Delete(fileName);
            return Results.NoContent();
        });
    }
}
