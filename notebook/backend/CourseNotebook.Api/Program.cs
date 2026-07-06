using Microsoft.EntityFrameworkCore;
using CourseNotebook.Api.Data;
using CourseNotebook.Api.Models;
using CourseNotebook.Api.Repositories;
using CourseNotebook.Api.Services;
using CourseNotebook.Api.Endpoints;

var builder = WebApplication.CreateBuilder(args);

// ── Configuration ────────────────────────────────────────────────────────────
var dbPath = builder.Configuration["DbPath"] ?? "notebook.db";
var imagePath = builder.Configuration["ImageStoragePath"] ?? "data/images";
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173" };

// ── Services ─────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlite($"Data Source={dbPath}"));

builder.Services.AddScoped<IRepository<Notebook>, EfRepository<Notebook>>();
builder.Services.AddScoped<IRepository<Page>, EfRepository<Page>>();
builder.Services.AddScoped<IRepository<CanvasElement>, EfRepository<CanvasElement>>();

builder.Services.AddScoped<NotebookService>();
builder.Services.AddScoped<PageService>();
builder.Services.AddScoped<ElementService>();
builder.Services.AddScoped<ImageService>();
builder.Services.AddScoped<ExportService>();
builder.Services.AddScoped<ImportService>();

builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins(allowedOrigins).AllowAnyMethod().AllowAnyHeader()));

builder.Services.AddOpenApi();

var app = builder.Build();

// ── Middleware ────────────────────────────────────────────────────────────────
app.UseCors();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

// Ensure DB exists and image storage directory is created on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

Directory.CreateDirectory(Path.GetFullPath(imagePath));

// Serve local images as static files at /api/images/{fileName}
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.GetFullPath(imagePath)),
    RequestPath = "/api/images"
});

// ── Endpoints ────────────────────────────────────────────────────────────────
app.MapNotebookEndpoints();
app.MapPageEndpoints();
app.MapElementEndpoints();
app.MapImageEndpoints();

app.Run();

public partial class Program { } // expose for integration tests
