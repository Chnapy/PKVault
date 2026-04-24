using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Memory;

/**
 * Cache time-based with sliding expiration.
 * Use MemoryCache with cleanup logic for memory concerns.
 */
public class CacheWithTiming(ILogger log) : IDisposable
{
    private readonly MemoryCache Cache = new(new MemoryCacheOptions());
    private readonly ConcurrentDictionary<string, DateTime> LastAccessUtc = [];
    private readonly TimeSpan Period = TimeSpan.FromSeconds(4);
    private readonly TimeSpan InactivityTimeout = TimeSpan.FromSeconds(10);
    private readonly ConcurrentDictionary<string, SemaphoreSlim> Semaphores = [];
    private Timer? CleanupTimer = null;

    public async Task<D> GetValue<D>(string cacheKey, Func<Task<D>> loadFn)
    {
        if (TryGetValue(cacheKey, out D? existing))
            return existing!;

        var semaphore = GetSemaphore(cacheKey);

        await semaphore.WaitAsync().ConfigureAwait(false);
        try
        {
            if (TryGetValue(cacheKey, out existing))
                return existing!;

            var value = await loadFn().ConfigureAwait(false);
            SetValue(cacheKey, value);
            return value;
        }
        finally
        {
            semaphore.Release();
        }
    }

    public D GetValue<D>(string cacheKey, Func<D> loadFn)
    {
        if (TryGetValue(cacheKey, out D? existing))
            return existing!;

        var semaphore = GetSemaphore(cacheKey);

        semaphore.Wait();
        try
        {
            if (TryGetValue(cacheKey, out existing))
                return existing!;

            var value = loadFn();
            SetValue(cacheKey, value);
            return value;
        }
        finally
        {
            semaphore.Release();
        }
    }

    public bool TryGetValue<D>(string cacheKey, out D? value)
    {
        if (Cache.TryGetValue(cacheKey, out value))
        {
            LastAccessUtc[cacheKey] = DateTime.UtcNow;
            return true;
        }

        LastAccessUtc.TryRemove(cacheKey, out _);
        return false;
    }

    public void SetValue<D>(string cacheKey, D value)
    {
        log.LogDebug($"Update cache: {cacheKey}");

        LastAccessUtc[cacheKey] = DateTime.UtcNow;

        var options = new MemoryCacheEntryOptions
        {
            SlidingExpiration = InactivityTimeout,
        };

        options.RegisterPostEvictionCallback((key, value, reason, state) =>
        {
            var k = key?.ToString() ?? string.Empty;

            LastAccessUtc.TryRemove(k, out _);
            Semaphores.TryRemove(k, out var semaphore);
        });

        Cache.Set(cacheKey, value, options);

        CleanupTimer ??= new Timer(_ => CleanupExpiredEntries(), null, Period, Period);
    }

    public void Remove(string cacheKey)
    {
        log.LogDebug($"Remove cache: {cacheKey}");

        LastAccessUtc.TryRemove(cacheKey, out _);
        Semaphores.TryRemove(cacheKey, out _);
        Cache.Remove(cacheKey);

        if (Cache.Count == 0)
        {
            CleanupTimer?.Dispose();
            CleanupTimer = null;
        }
    }

    private void CleanupExpiredEntries()
    {
        var now = DateTime.UtcNow;

        foreach (var entry in LastAccessUtc)
        {
            if (now - entry.Value > InactivityTimeout)
            {
                Remove(entry.Key);
            }
        }
    }

    private SemaphoreSlim GetSemaphore(string cacheKey)
    {
        return Semaphores.GetOrAdd(cacheKey, (_) => new(1, 1));
    }

    public void Dispose()
    {
        CleanupTimer?.Dispose();
        Cache.Dispose();

        foreach (var semaphore in Semaphores.Values)
            semaphore.Dispose();

        LastAccessUtc.Clear();
        Semaphores.Clear();

        GC.SuppressFinalize(this);
    }
}
