public partial class SetupMiddleware(RequestDelegate next, LoaderService loaderService)
{
    public async Task Invoke(HttpContext context)
    {
        await loaderService.WaitForSetup();
        await next(context);
    }
}
