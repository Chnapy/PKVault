using System.Text.Json;
using Microsoft.EntityFrameworkCore;

public class SessionDbContext(
    SessionService sessionService
) : DbContext
{
    // static ConcurrentDictionary<Guid, DbContextId> contexts = [];

    public DbSet<BankEntity> Banks { get; set; }
    public DbSet<BoxEntity> Boxes { get; set; }
    public DbSet<PkmVersionEntity> PkmVersions { get; set; }
    public DbSet<DexEntity> Pokedex { get; set; }

    public DataUpdateFlagsState<string> BanksFlags = new();
    public DataUpdateFlagsState<string> BoxesFlags = new();
    public DataUpdateFlagsState<string> PkmVersionsFlags = new();

    // The following configures EF to create a Sqlite database file in the
    // special "local" folder for your platform.
    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        options
            .UseSqlite($"Data Source={sessionService.SessionDbPath}")
            .UseAsyncSeeding(DbSeeding.Seed);

        // contexts.TryAdd(ContextId.InstanceId, ContextId);

        // Console.WriteLine($"ADD DB CONTEXT = {ContextId}");
        // Console.WriteLine($"REMAINS = {string.Join('\n', contexts)}");
    }

    // public override void Dispose()
    // {
    //     contexts.Remove(ContextId.InstanceId, out _);

    //     Console.WriteLine($"REMOVE DB CONTEXT = {ContextId}");
    //     Console.WriteLine($"REMAINS = {string.Join('\n', contexts)}");

    //     base.Dispose();
    // }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BankEntity>(entity =>
        {
            entity.HasKey(p => p.Id);

            entity.Property(p => p.View)
              .HasConversion(
                  v => JsonSerializer.Serialize(v, EntityJsonContext.Default.BankView),
                  v => JsonSerializer.Deserialize(v, EntityJsonContext.Default.BankView)!
              )
              .HasColumnType("TEXT");
        });

        modelBuilder.Entity<BoxEntity>(entity =>
        {
            entity.HasKey(p => p.Id);
        });
        modelBuilder.Entity<BoxEntity>()
            .HasOne<BankEntity>()
            .WithMany()
            .HasForeignKey(p => p.BankId);

        modelBuilder.Entity<PkmVersionEntity>(entity =>
        {
            entity.HasKey(p => p.Id);

            entity.HasIndex(p => p.BoxId);
            entity.HasIndex(p => new { p.BoxId, p.BoxSlot });

            entity.HasIndex(p => p.AttachedSaveId)
                .HasFilter("AttachedSaveId IS NOT NULL");
            entity.HasIndex(p => new { p.AttachedSaveId, p.AttachedSavePkmIdBase })
                .HasFilter("AttachedSaveId IS NOT NULL");
        });
        modelBuilder.Entity<PkmVersionEntity>()
            .HasOne<BoxEntity>()
            .WithMany()
            .HasForeignKey(p => p.BoxId);

        modelBuilder.Entity<DexEntity>(entity =>
        {
            entity.HasKey(p => p.Id);

            entity.Property(p => p.Forms)
              .HasConversion(
                  v => JsonSerializer.Serialize(v, EntityJsonContext.Default.ListDexEntityForm),
                  v => JsonSerializer.Deserialize(v, EntityJsonContext.Default.ListDexEntityForm)!
              )
              .HasColumnType("TEXT");
        });
    }
}
