using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.DependencyInjection;

namespace PKVault.Core;

public class SessionDbContextFactory : IDesignTimeDbContextFactory<SessionDbContext>
{
    public SessionDbContext CreateDbContext(string[] args)
    {
        Program.Initialize();

        var services = new ServiceCollection();
        Program.ConfigureServices(services);
        var sp = services.BuildServiceProvider();

        return sp.GetRequiredService<SessionDbContext>();
    }
}
