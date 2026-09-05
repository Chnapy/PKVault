using Microsoft.Extensions.DependencyInjection;
using PKVault.Core;
using PKVault.Core.OpenApi;

public class CoreRouterTests
{
    [Fact]
    public void NoRoutesDuplicates()
    {
        var sp = BuildTestServiceProvider();
        var routes = new CoreRouter().Routes;
        var duplicates = routes
            .GroupBy(r => (r.HttpMethod, r.HttpTemplate))
            .Where(g => g.Count() > 1)
            .ToList();

        Assert.Empty(duplicates);
    }

    [Fact]
    public void AllRoutesResolvableWithDI()
    {
        var sp = BuildTestServiceProvider();
        var routes = new CoreRouter().Routes;

        foreach (var controllerType in routes.Select(r => r.MethodInfo.DeclaringType).Distinct())
            Assert.NotNull(sp.GetService(controllerType!));
    }

    [Fact]
    public void AllRoutesTypesResolvableForJSON()
    {
        var routes = new CoreRouter().Routes;

        foreach (var route in routes)
        {
            Type[] types = [
                .. route.Parameters.Select(p => OpenApiGenerator.UnwrapTaskType(p.Param.ParameterType)),
                OpenApiGenerator.UnwrapTaskType(route.MethodInfo.ReturnType),
            ];

            foreach (var type in types)
            {
                AssertIsTypeJSONParsable(type);
            }
        }
    }

    private static void AssertIsTypeJSONParsable(Type type)
    {
        var finalType = CoreRouter.GetFinalType(type);
        if (CoreRouter.IsTypeVoidLike(finalType)
            || finalType == typeof(CoreFile)
            || typeof(ICoreResponse).IsAssignableFrom(finalType)
        )
            return;

        ArgumentNullException.ThrowIfNull(RouteJsonContext.Default.GetTypeInfo(finalType), $"Missing RouteJsonContext TypeInfo for type : {finalType}");
    }

    private static IServiceProvider BuildTestServiceProvider()
    {
        var services = new ServiceCollection();
        Program.ConfigureServices(services);
        return services.BuildServiceProvider();
    }
}
