using Microsoft.EntityFrameworkCore;
using CourseNotebook.Api.Models;

namespace CourseNotebook.Api.Data;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Notebook> Notebooks => Set<Notebook>();
    public DbSet<Page> Pages => Set<Page>();
    public DbSet<CanvasElement> CanvasElements => Set<CanvasElement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Notebook>(e =>
        {
            e.HasKey(n => n.Id);
            e.Property(n => n.Id).ValueGeneratedNever();
            e.HasMany(n => n.Pages)
             .WithOne(p => p.Notebook)
             .HasForeignKey(p => p.NotebookId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Page>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Id).ValueGeneratedNever();
            e.HasIndex(p => p.NotebookId);
            e.HasMany(p => p.Elements)
             .WithOne(el => el.Page)
             .HasForeignKey(el => el.PageId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CanvasElement>(e =>
        {
            e.HasKey(el => el.Id);
            e.Property(el => el.Id).ValueGeneratedNever();
            e.HasIndex(el => el.PageId);
            e.HasIndex(el => el.ElementType);
        });
    }
}
