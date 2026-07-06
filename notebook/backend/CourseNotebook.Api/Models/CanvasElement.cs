namespace CourseNotebook.Api.Models;

public sealed class CanvasElement
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string PageId { get; set; } = string.Empty;

    /// <summary>stroke | text | image | sticker | mindmap</summary>
    public string ElementType { get; set; } = string.Empty;

    /// <summary>JSON blob — schema varies per ElementType</summary>
    public string Data { get; set; } = "{}";

    public double X { get; set; }
    public double Y { get; set; }
    public double? Width { get; set; }
    public double? Height { get; set; }
    public double Rotation { get; set; }
    public int ZOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Page Page { get; set; } = null!;
}
