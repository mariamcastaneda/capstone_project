namespace CourseNotebook.Api.Models;

public sealed class Page
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string NotebookId { get; set; } = string.Empty;
    public string Name { get; set; } = "Page 1";
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Notebook Notebook { get; set; } = null!;
    public ICollection<CanvasElement> Elements { get; set; } = new List<CanvasElement>();
}
