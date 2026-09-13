using System.IO.Compression;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization.Metadata;
using Android.Content;
using Android.Provider;
using Microsoft.Extensions.FileSystemGlobbing;
using PKVault.Core;
using Uri = Android.Net.Uri;

namespace PKVault.Mobile;

public class AndroidFileIOService : IFileIOService
{
    private readonly IFileIOService inner;
    private readonly SafTreeMapper mapper;
    private ContentResolver resolver => mapper.Resolver;
    public MatcherUtil Matcher { get; }

    public AndroidFileIOService(IFileIOService _inner, SafTreeMapper _mapper)
    {
        inner = _inner;
        mapper = _mapper;
        Matcher = new()
        {
            GetAllPaths = (rootDir, globs) =>
            {
                var results = new List<string>();

                var treeHandled = mapper.TryResolve(rootDir, out var treeUri, out var isTree, out var relRoot) && isTree;
                if (treeHandled)
                    results.AddRange(GetAllFilesSaf(treeUri, relRoot, rootDir, globs));

                // Complete with permissions "unique document" for literal patterns (no wildcard)
                foreach (var glob in globs)
                {
                    if (glob.Contains('*') || glob.Contains('?'))
                        continue;

                    var candidate = Path.GetFullPath(Path.Combine(rootDir, glob));
                    if (mapper.TryResolveExactFile(candidate, out _) && !results.Contains(candidate))
                        results.Add(candidate);
                }

                if (!treeHandled && results.Count == 0)
                    return inner.Matcher.GetAllPaths(rootDir, globs);

                return results.ToArray();
            }
        };
    }

    private string[] GetAllFilesSaf(Uri treeUri, string relativeRoot, string rootDir, string[] globs)
    {
        string? parentDocId;
        if (string.IsNullOrEmpty(relativeRoot))
        {
            parentDocId = DocumentsContract.GetTreeDocumentId(treeUri);
        }
        else
        {
            var folderUri = SafDocument.ResolveExisting(resolver, treeUri, relativeRoot);
            if (folderUri is null)
                return [];
            parentDocId = DocumentsContract.GetDocumentId(folderUri);
        }

        var files = SafDocument.ListRecursiveRelative(resolver, treeUri, parentDocId, "")
            .Where(e => !e.IsDirectory)
            .Select(e => Path.Combine(rootDir, e.RelativePath))
            .ToArray();

        // static string NormalizeGlobPattern(string pattern) =>
        //     pattern.EndsWith('/') ? pattern + "**" : pattern;

        var globMatcher = new Matcher();
        globMatcher.AddIncludePatterns(
            globs//.Select(NormalizeGlobPattern)
        );

        var result = globMatcher.Match(rootDir, files);

        return result.Files.Select(f => Path.Combine(rootDir, f.Path)).ToArray();
    }

    bool TryResolveSaf(string path, out Uri documentUri)
    {
        documentUri = default!;
        if (!mapper.TryResolve(path, out var uri, out var isTree, out var relative))
            return false;

        if (!isTree)
        {
            documentUri = uri;
            return true;
        }

        var resolved = SafDocument.ResolveExisting(resolver, uri, relative);
        if (resolved is null)
            return false;

        documentUri = resolved;
        return true;
    }

    public async Task<byte[]> ReadBytes(string path)
    {
        if (!TryResolveSaf(path, out var uri))
            return await inner.ReadBytes(path);

        using var stream = resolver.OpenInputStream(uri) ?? throw new FileNotFoundException(path);
        using var ms = new MemoryStream();
        await stream.CopyToAsync(ms);
        return ms.ToArray();
    }

    public byte[] ReadBytesSync(string path)
    {
        if (!TryResolveSaf(path, out var uri))
            return inner.ReadBytesSync(path);

        using var stream = resolver.OpenInputStream(uri) ?? throw new FileNotFoundException(path);
        using var ms = new MemoryStream();
        stream.CopyTo(ms);
        return ms.ToArray();
    }

    public async Task<string> ReadText(string path)
    {
        if (!TryResolveSaf(path, out var uri))
            return await inner.ReadText(path);

        using var stream = resolver.OpenInputStream(uri) ?? throw new FileNotFoundException(path);
        using var reader = new StreamReader(stream);
        return await reader.ReadToEndAsync();
    }

    public async Task<TValue> ReadJSONFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue defaultValue)
        => await ReadJSONFile(path, jsonTypeInfo) ?? defaultValue;

    public async Task<TValue?> ReadJSONFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo)
    {
        if (!TryResolveSaf(path, out var uri))
            return await inner.ReadJSONFile(path, jsonTypeInfo);

        using var stream = resolver.OpenInputStream(uri) ?? throw new FileNotFoundException(path);
        return await JsonSerializer.DeserializeAsync(stream, jsonTypeInfo);
    }

    public TValue ReadJSONFileSync<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue defaultValue)
    {
        if (!TryResolveSaf(path, out var uri))
            return inner.ReadJSONFileSync(path, jsonTypeInfo, defaultValue);

        using var stream = resolver.OpenInputStream(uri) ?? throw new FileNotFoundException(path);
        return JsonSerializer.Deserialize(stream, jsonTypeInfo) ?? defaultValue;
    }

    public IArchive ReadZip(string path)
    {
        if (!TryResolveSaf(path, out var uri))
            return inner.ReadZip(path);

        using var input = resolver.OpenInputStream(uri) ?? throw new FileNotFoundException(path);
        var ms = new MemoryStream();
        input.CopyTo(ms);
        ms.Position = 0;
        var zip = new ZipArchive(ms);
        return new Archive(zip, new System.IO.Abstractions.FileSystem());
    }

    public (bool TooSmall, bool TooBig) CheckGameFile(string path)
    {
        if (!TryResolveSaf(path, out var uri))
            return inner.CheckGameFile(path);

        var size = SafDocument.GetSize(resolver, uri) ?? 0;
        return CheckGameFile(size);
    }

    public (bool TooSmall, bool TooBig) CheckGameFile(long length) => inner.CheckGameFile(length);

    public bool Exists(string path) => TryResolveSaf(path, out _) || inner.Exists(path);

    public DateTime GetLastWriteTime(string path) => GetLastWriteTimeUtc(path).ToLocalTime();

    public DateTime GetLastWriteTimeUtc(string path)
    {
        if (!TryResolveSaf(path, out var uri))
            return inner.GetLastWriteTimeUtc(path);

        var meta = SafDocument.GetSingleDocumentMeta(resolver, uri);
        return meta is null ? default : DateTimeOffset.FromUnixTimeMilliseconds(meta.Value.LastModifiedMs).UtcDateTime;
    }

    public async Task WriteBytes(string path, byte[] value)
    {
        if (!TryResolveSaf(path, out var uri))
        {
            await inner.WriteBytes(path, value);
            return;
        }

        using var stream = resolver.OpenOutputStream(uri, "wt") ?? throw new IOException($"Cannot write {path}");
        await stream.WriteAsync(value);
    }

    public async Task WriteJSONFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue value)
    {
        if (!TryResolveSaf(path, out var uri))
        {
            await inner.WriteJSONFile(path, jsonTypeInfo, value);
            return;
        }

        using var stream = resolver.OpenOutputStream(uri, "wt") ?? throw new IOException($"Cannot write {path}");
        await JsonSerializer.SerializeAsync(stream, value, jsonTypeInfo);
    }

    public async Task WriteJSONGZipFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue value)
    {
        if (!TryResolveSaf(path, out var uri))
        {
            await inner.WriteJSONGZipFile(path, jsonTypeInfo, value);
            return;
        }

        var json = JsonSerializer.Serialize(value, jsonTypeInfo);
        using var stream = resolver.OpenOutputStream(uri, "wt") ?? throw new IOException($"Cannot write {path}");
        using var gzip = new GZipStream(stream, CompressionLevel.Optimal);
        await gzip.WriteAsync(Encoding.UTF8.GetBytes(json));
    }

    public bool Delete(string path)
    {
        if (!TryResolveSaf(path, out var uri))
            return inner.Delete(path);
        return DocumentsContract.DeleteDocument(resolver, uri);
    }

    public void Copy(string sourceFileName, string destFileName, bool overwrite)
    {
        if (TryResolveSaf(sourceFileName, out _) || TryResolveSaf(destFileName, out _))
            throw new NotSupportedException($"Copy cannot be used with paths out-of-app (SAF), sourceFileName={sourceFileName}");
        inner.Copy(sourceFileName, destFileName, overwrite);
    }

    public void Move(string sourceFileName, string destFileName, bool overwrite)
    {
        if (TryResolveSaf(sourceFileName, out _) || TryResolveSaf(destFileName, out _))
            throw new NotSupportedException($"Move cannot be used with paths out-of-app (SAF), sourceFileName={sourceFileName}");
        inner.Move(sourceFileName, destFileName, overwrite);
    }

    public void CreateDirectory(string path)
    {
        if (TryResolveSaf(path, out _))
            throw new NotSupportedException($"CreateDirectory cannot be used with paths out-of-app (SAF), path={path}");
        inner.CreateDirectory(path);
    }

    public void CreateDirectoryIfAny(string path)
    {
        if (TryResolveSaf(path, out _))
            return;
        inner.CreateDirectoryIfAny(path);
    }
}
