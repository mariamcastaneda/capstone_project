using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using CourseNotebook.Api.Data;

namespace CourseNotebook.Tests.Integration;

public class NotebookEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private static readonly SqliteConnection _conn;

    static NotebookEndpointTests()
    {
        _conn = new SqliteConnection("Data Source=:memory:");
        _conn.Open(); // keep open so in-memory DB survives across requests
    }

    public NotebookEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
            builder.ConfigureServices(services =>
            {
                // Remove existing DbContext configuration — use same SQLite provider with :memory:
                var toRemove = services.Where(d =>
                    d.ServiceType == typeof(DbContextOptions<AppDbContext>) ||
                    d.ServiceType == typeof(AppDbContext)).ToList();
                foreach (var d in toRemove) services.Remove(d);

                services.AddDbContext<AppDbContext>(o => o.UseSqlite(_conn));
            })).CreateClient();

        // Ensure schema exists on the in-memory connection
        using var scope = factory.Services.CreateScope();
    }

    [Fact]
    public async Task GetNotebooks_ReturnsEmptyList_Initially()
    {
        var res = await _client.GetAsync("/api/notebooks");
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await res.Content.ReadAsStringAsync();
        body.Should().Contain("[]");
    }

    [Fact]
    public async Task PostNotebook_CreatesAndReturns201()
    {
        var res = await _client.PostAsJsonAsync("/api/notebooks", new { name = "Test NB", colorTag = "#FF69B4" });
        res.StatusCode.Should().Be(HttpStatusCode.Created);
        var doc = JsonDocument.Parse(await res.Content.ReadAsStringAsync());
        doc.RootElement.GetProperty("name").GetString().Should().Be("Test NB");
    }

    [Fact]
    public async Task PutNotebook_UpdatesName()
    {
        var created = await (await _client.PostAsJsonAsync("/api/notebooks", new { name = "Old" }))
            .Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetString();

        var res = await _client.PutAsJsonAsync($"/api/notebooks/{id}", new { name = "New" });
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = JsonDocument.Parse(await res.Content.ReadAsStringAsync());
        updated.RootElement.GetProperty("name").GetString().Should().Be("New");
    }

    [Fact]
    public async Task DeleteNotebook_Returns204()
    {
        var created = await (await _client.PostAsJsonAsync("/api/notebooks", new { name = "To Delete" }))
            .Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetString();

        var res = await _client.DeleteAsync($"/api/notebooks/{id}");
        res.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task PostPage_CreatesPageUnderNotebook()
    {
        var nb = await (await _client.PostAsJsonAsync("/api/notebooks", new { name = "NB" }))
            .Content.ReadFromJsonAsync<JsonElement>();
        var nbId = nb.GetProperty("id").GetString();

        var res = await _client.PostAsJsonAsync($"/api/notebooks/{nbId}/pages", new { name = "Page 1" });
        res.StatusCode.Should().Be(HttpStatusCode.Created);
        var page = JsonDocument.Parse(await res.Content.ReadAsStringAsync());
        page.RootElement.GetProperty("notebookId").GetString().Should().Be(nbId);
    }
}
