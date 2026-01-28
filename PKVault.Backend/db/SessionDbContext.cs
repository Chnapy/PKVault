using System.Text.Json;
using Microsoft.EntityFrameworkCore;

public class SessionDbContext(
    SessionService sessionService, DbSeedingService dbSeedingService
) : DbContext
{
    // static ConcurrentDictionary<Guid, DbContextId> contexts = [];

    public DbSet<BankEntity> Banks { get; set; }
    public DbSet<BoxEntity> Boxes { get; set; }
    public DbSet<PkmVersionEntity> PkmVersions { get; set; }
    public DbSet<DexFormEntity> Pokedex { get; set; }
    public DbSet<PkmFileEntity> PkmFiles { get; set; }

    public DataUpdateFlagsState BanksFlags = new();
    public DataUpdateFlagsState BoxesFlags = new();
    public DataUpdateFlagsState PkmVersionsFlags = new();

    // The following configures EF to create a Sqlite database file in the
    // special "local" folder for your platform.
    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        options
            .UseSqlite($"Data Source={sessionService.SessionDbPath}")
            .LogTo(Console.WriteLine, LogUtil.DBLogLevel)
            .EnableDetailedErrors()
            .EnableSensitiveDataLogging()   // PKVault does not contain any sensitive data
            .UseAsyncSeeding(dbSeedingService.Seed);

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

            entity
                .HasOne<BankEntity>()
                .WithMany()
                .HasForeignKey(p => p.BankId);
        });

        modelBuilder.Entity<PkmVersionEntity>(entity =>
        {
            entity.HasKey(p => p.Id);

            entity.HasIndex(p => p.BoxId);
            entity.HasIndex(p => new { p.BoxId, p.BoxSlot });

            entity.HasIndex(p => p.AttachedSaveId)
                .HasFilter("AttachedSaveId IS NOT NULL");
            entity.HasIndex(p => new { p.AttachedSaveId, p.AttachedSavePkmIdBase })
                .HasFilter("AttachedSaveId IS NOT NULL");

            entity.Property(p => p.Filepath)
                .IsRequired();

            entity.HasIndex(p => new { p.Species, p.Form, p.Gender });
            entity.HasIndex(p => new { p.Species, p.Form, p.Gender, p.IsShiny });

            entity
                .HasOne<BoxEntity>()
                .WithMany()
                .HasForeignKey(e => e.BoxId);

            entity
                .HasOne(p => p.PkmFile)
                .WithOne()
                .HasForeignKey<PkmVersionEntity>(p => p.Filepath)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);
        });

        modelBuilder.Entity<PkmFileEntity>(entity =>
        {
            entity.HasKey(p => p.Filepath);
        });

        modelBuilder.Entity<DexFormEntity>(entity =>
        {
            entity.HasKey(p => p.Id);

            entity.HasIndex(p => p.Species);
            entity.HasIndex(p => p.Form);
            entity.HasIndex(p => p.Gender);
        });
    }
}
