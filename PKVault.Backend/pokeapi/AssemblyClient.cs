using System.Buffers;
using System.IO.Compression;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization.Metadata;

public partial class AssemblyClient
{
    private static readonly Assembly assembly = Assembly.GetExecutingAssembly();

    public async Task<Stream> GetAsync(List<string> fileParts)
    {
        byte[] rentedBuffer = ArrayPool<byte>.Shared.Rent(
            16 * 1024 // buffer 16 Ko
        );

        try
        {
            return GetResourceFromAssembly(fileParts);
        }
        finally
        {
            // return buffer to pool
            ArrayPool<byte>.Shared.Return(rentedBuffer);
        }
    }

    public async Task<T?> GetAsyncJson<T>(List<string> fileParts, JsonTypeInfo<T> jsonContext)
    {
        byte[] rentedBuffer = ArrayPool<byte>.Shared.Rent(jsonContext.Options.DefaultBufferSize);

        try
        {
            using var stream = GetResourceFromAssembly(fileParts);

            return await DeserializeResource(stream, jsonContext);
        }
        finally
        {
            // return buffer to pool
            ArrayPool<byte>.Shared.Return(rentedBuffer);
        }
    }

    public async Task<T?> GetAsyncJsonGz<T>(List<string> fileParts, JsonTypeInfo<T> jsonContext)
    {
        byte[] rentedBuffer = ArrayPool<byte>.Shared.Rent(jsonContext.Options.DefaultBufferSize);

        try
        {
            using var stream = GetResourceFromAssembly(fileParts);
            using var gzipStream = new GZipStream(stream, CompressionMode.Decompress);

            return await DeserializeResource(gzipStream, jsonContext);
        }
        finally
        {
            // return buffer to pool
            ArrayPool<byte>.Shared.Return(rentedBuffer);
        }
    }

    private async Task<T?> DeserializeResource<T>(Stream jsonStream, JsonTypeInfo<T> jsonContext)
    {
        return await JsonSerializer.DeserializeAsync(jsonStream, jsonContext);
    }

    private Stream GetResourceFromAssembly(List<string> fileParts)
    {
        List<string> assemblyParts = [
            "PKVault.Backend",
            ..fileParts
        ];

        var assemblyName = string.Join('.', assemblyParts.Select(part =>
        {
            part = part.Replace('-', '_');

            var isInt = int.TryParse(part, out _);
            if (isInt)
            {
                part = $"_{part}";
            }

            return part;
        }));

        return assembly.GetManifestResourceStream(assemblyName)
            ?? throw new KeyNotFoundException($"RESOURCE NOT FOUND: {assemblyName}\n{string.Join('\n', assembly.GetManifestResourceNames())}");
    }
}
