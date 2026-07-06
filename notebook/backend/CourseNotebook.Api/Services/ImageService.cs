using System.Text.RegularExpressions;

namespace CourseNotebook.Api.Services;

public sealed class ImageService
{
    private static readonly long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB
    private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
        { "image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif" };
    private static readonly HashSet<string> CompressableMimeTypes = new(StringComparer.OrdinalIgnoreCase)
        { "image/jpeg", "image/png", "image/webp" };

    private readonly string _storagePath;

    public ImageService(IConfiguration config)
        => _storagePath = Path.GetFullPath(config["ImageStoragePath"] ?? "data/images");

    public async Task<string> SaveAsync(IFormFile file, CancellationToken ct = default)
    {
        if (file.Length > MaxFileSizeBytes)
            throw new InvalidOperationException($"File exceeds the 10 MB limit ({file.Length / 1024 / 1024} MB).");

        if (!AllowedMimeTypes.Contains(file.ContentType))
            throw new InvalidOperationException($"Unsupported file type: {file.ContentType}.");

        Directory.CreateDirectory(_storagePath);
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var safeFileName = $"{Guid.NewGuid()}{ext}";

        var destPath = Path.Combine(_storagePath, safeFileName);

        if (CompressableMimeTypes.Contains(file.ContentType))
        {
            using var stream = file.OpenReadStream();
            var bytes = await CompressImageAsync(stream, ct);
            await File.WriteAllBytesAsync(destPath, bytes, ct);
        }
        else
        {
            using var dest = File.Create(destPath);
            await file.CopyToAsync(dest, ct);
        }

        return safeFileName;
    }

    public void Delete(string fileName)
    {
        if (!IsValidFileName(fileName)) return;
        var path = Path.Combine(_storagePath, fileName);
        if (File.Exists(path)) File.Delete(path);
    }

    private static bool IsValidFileName(string fileName)
        => !string.IsNullOrWhiteSpace(fileName)
            && !fileName.Contains("..")
            && !Path.IsPathRooted(fileName)
            && Regex.IsMatch(fileName, @"^[a-zA-Z0-9\-_\.]+$");

    private static async Task<byte[]> CompressImageAsync(Stream input, CancellationToken ct)
    {
        // Use SkiaSharp if available; fall back to copying as-is (compression is best-effort)
        // For v1 we read into memory and return — real compression added in Phase 9 hardening
        using var ms = new MemoryStream();
        await input.CopyToAsync(ms, ct);
        return ms.ToArray();
    }
}
