/**
 * Lock value T with invalidation.
 * Params P allows more flexibility.
 */
public class Locker<P, T>(string Name, P initialParam, Func<P, Task<T>> DefineValue)
{
    private readonly SemaphoreSlim Lock = new(1, 1);
    public bool Initialized { get; private set; }
    public T? Value { get; private set; }
    private P Param = initialParam;

    public async Task<T> GetValue()
    {
        await EnsureInitialized();
        return Value!;
    }

    public void Invalidate(P param)
    {
        Param = param;
        Initialized = false;
    }

    private async Task EnsureInitialized()
    {
        if (Initialized) return;

        var timeoutCts = new CancellationTokenSource();
        var delay = 7000;
        var timeoutTask = Task.Delay(delay, timeoutCts.Token);
        var lockTask = Lock.WaitAsync();

        await Task.WhenAny([lockTask, timeoutTask]);

        if (!lockTask.IsCompleted)
        {
            throw new InvalidOperationException($"Locker {Name}: Probable recursive call dead-lock after {delay}ms");
        }

        try
        {
            timeoutCts.Cancel();
            await timeoutTask;
        }
        catch (OperationCanceledException)
        { }

        try
        {
            if (Initialized) return;

            var time = LogUtil.Time($"Locker {Name}: Initialize");
            Value = await DefineValue(Param);
            Initialized = true;
            time();
        }
        finally
        {
            Lock.Release();
        }
    }
}
