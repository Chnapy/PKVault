using System.Buffers;
using System.IO.Compression;
using System.Reflection;
using System.Text.Json;

public partial class AssemblyClient(JsonSerializerOptions jsonOptions)
{
    private static readonly Assembly assembly = Assembly.GetExecutingAssembly();

    public async Task<Stream> GetAsync(List<string> fileParts)
    {
        byte[] rentedBuffer = ArrayPool<byte>.Shared.Rent(jsonOptions.DefaultBufferSize);

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

    public async Task<T?> GetAsyncJson<T>(List<string> fileParts)
    {
        byte[] rentedBuffer = ArrayPool<byte>.Shared.Rent(jsonOptions.DefaultBufferSize);

        try
        {
            using var stream = GetResourceFromAssembly(fileParts);

            return await DeserializeResource<T>(stream);
        }
        finally
        {
            // return buffer to pool
            ArrayPool<byte>.Shared.Return(rentedBuffer);
        }
    }

    public async Task<T?> GetAsyncJsonGz<T>(List<string> fileParts)
    {
        byte[] rentedBuffer = ArrayPool<byte>.Shared.Rent(jsonOptions.DefaultBufferSize);

        try
        {
            using var stream = GetResourceFromAssembly(fileParts);
            using var gzipStream = new GZipStream(stream, CompressionMode.Decompress);

            return await DeserializeResource<T>(gzipStream);
        }
        finally
        {
            // return buffer to pool
            ArrayPool<byte>.Shared.Return(rentedBuffer);
        }
    }

    private async Task<T?> DeserializeResource<T>(Stream jsonStream)
    {
        return await JsonSerializer.DeserializeAsync<T>(jsonStream, jsonOptions);
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

        return assembly.GetManifestResourceStream(assemblyName) ?? throw new KeyNotFoundException($"RESOURCE NOT FOUND: {assemblyName}");
    }
}
