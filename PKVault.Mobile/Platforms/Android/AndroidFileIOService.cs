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

    bool TryResolveSafRead(string path, out Uri documentUri)
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

    bool TryResolveSafWrite(string path, out Uri documentUri)
    {
        documentUri = default!;
        if (!mapper.TryResolve(path, out var uri, out var isTree, out var relative))
            return false;

        if (!isTree)
        {
            documentUri = uri;
            return true;
        }

        documentUri = SafDocument.ResolveOrCreateFile(resolver, uri, relative);
        return true;
    }

    public async Task<byte[]> ReadBytes(string path)
    {
        if (!TryResolveSafRead(path, out var uri))
            return await inner.ReadBytes(path);

        using var stream = resolver.OpenInputStream(uri) ?? throw new FileNotFoundException(path);
        using var ms = new MemoryStream();
        await stream.CopyToAsync(ms);
        return ms.ToArray();
    }

    public byte[] ReadBytesSync(string path)
    {
        if (!TryResolveSafRead(path, out var uri))
            return inner.ReadBytesSync(path);

        using var stream = resolver.OpenInputStream(uri) ?? throw new FileNotFoundException(path);
        using var ms = new MemoryStream();
        stream.CopyTo(ms);
        return ms.ToArray();
    }

    public async Task<string> ReadText(string path)
    {
        if (!TryResolveSafRead(path, out var uri))
            return await inner.ReadText(path);

        using var stream = resolver.OpenInputStream(uri) ?? throw new FileNotFoundException(path);
        using var reader = new StreamReader(stream);
        return await reader.ReadToEndAsync();
    }

    public async Task<TValue> ReadJSONFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue defaultValue)
        => await ReadJSONFile(path, jsonTypeInfo) ?? defaultValue;

    public async Task<TValue?> ReadJSONFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo)
    {
        if (!TryResolveSafRead(path, out var uri))
            return await inner.ReadJSONFile(path, jsonTypeInfo);

        using var stream = resolver.OpenInputStream(uri) ?? throw new FileNotFoundException(path);
        return await JsonSerializer.DeserializeAsync(stream, jsonTypeInfo);
    }

    public TValue ReadJSONFileSync<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue defaultValue)
    {
        if (!TryResolveSafRead(path, out var uri))
            return inner.ReadJSONFileSync(path, jsonTypeInfo, defaultValue);

        using var stream = resolver.OpenInputStream(uri) ?? throw new FileNotFoundException(path);
        return JsonSerializer.Deserialize(stream, jsonTypeInfo) ?? defaultValue;
    }

    public IArchive ReadZip(string path)
    {
        MemoryStream ms;

        if (TryResolveSafRead(path, out var uri))
        {
            using var input = resolver.OpenInputStream(uri) ?? throw new FileNotFoundException(path);
            ms = new MemoryStream();
            input.CopyTo(ms);
            ms.Position = 0;
        }
        else
        {
            ms = new MemoryStream(inner.ReadBytesSync(path));
        }

        return new Archive(new ZipArchive(ms), OpenDestinationStream);
    }

    public (bool TooSmall, bool TooBig) CheckGameFile(string path)
    {
        if (!TryResolveSafRead(path, out var uri))
            return inner.CheckGameFile(path);

        var size = SafDocument.GetSize(resolver, uri) ?? 0;
        return CheckGameFile(size);
    }

    public (bool TooSmall, bool TooBig) CheckGameFile(long length) => inner.CheckGameFile(length);

    public bool Exists(string path) => TryResolveSafRead(path, out _) || inner.Exists(path);

    public DateTime GetLastWriteTime(string path) => GetLastWriteTimeUtc(path).ToLocalTime();

    public DateTime GetLastWriteTimeUtc(string path)
    {
        if (!TryResolveSafRead(path, out var uri))
            return inner.GetLastWriteTimeUtc(path);

        var meta = SafDocument.GetSingleDocumentMeta(resolver, uri);
        return meta is null ? default : DateTimeOffset.FromUnixTimeMilliseconds(meta.Value.LastModifiedMs).UtcDateTime;
    }

    public async Task WriteBytes(string path, byte[] value)
    {
        if (!TryResolveSafWrite(path, out var uri))
        {
            await inner.WriteBytes(path, value);
            return;
        }

        using var stream = resolver.OpenOutputStream(uri, "wt") ?? throw new IOException($"Cannot write {path}");
        await stream.WriteAsync(value);
    }

    public async Task WriteJSONFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue value)
    {
        if (!TryResolveSafWrite(path, out var uri))
        {
            await inner.WriteJSONFile(path, jsonTypeInfo, value);
            return;
        }

        using var stream = resolver.OpenOutputStream(uri, "wt") ?? throw new IOException($"Cannot write {path}");
        await JsonSerializer.SerializeAsync(stream, value, jsonTypeInfo);
    }

    public async Task WriteJSONGZipFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue value)
    {
        if (!TryResolveSafWrite(path, out var uri))
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
        if (!TryResolveSafRead(path, out var uri))
            return inner.Delete(path);
        return DocumentsContract.DeleteDocument(resolver, uri);
    }

    bool IsSafManaged(string path) => mapper.TryResolve(path, out _, out _, out _);

    Stream OpenSourceStream(string path)
    {
        if (IsSafManaged(path))
        {
            if (!TryResolveSafRead(path, out var uri))
                throw new FileNotFoundException(path);
            return resolver.OpenInputStream(uri) ?? throw new FileNotFoundException(path);
        }
        return File.OpenRead(path);
    }

    Stream OpenDestinationStream(string path, bool overwrite = true)
    {
        path = FileIOService.NormalizePath(path);

        if (!overwrite && Exists(path))
            throw new IOException($"The file '{path}' already exists.");

        if (TryResolveSafWrite(path, out var uri))
            return resolver.OpenOutputStream(uri, "wt") ?? throw new IOException($"Cannot write {path}");

        var dir = Path.GetDirectoryName(path);
        if (!string.IsNullOrEmpty(dir))
            Directory.CreateDirectory(dir);
        return new FileStream(path, overwrite ? FileMode.Create : FileMode.CreateNew, FileAccess.Write);
    }

    public void Copy(string sourceFileName, string destFileName, bool overwrite)
    {
        if (!IsSafManaged(sourceFileName) && !IsSafManaged(destFileName))
        {
            inner.Copy(sourceFileName, destFileName, overwrite);
            return;
        }

        if (Path.GetFullPath(sourceFileName) == Path.GetFullPath(destFileName))
            throw new IOException($"Source and destination are the same file: {sourceFileName}");

        if (!overwrite && Exists(destFileName))
            throw new IOException($"The file '{destFileName}' already exists.");

        using var input = OpenSourceStream(sourceFileName);
        using var output = OpenDestinationStream(destFileName);
        input.CopyTo(output);
    }

    public void Move(string sourceFileName, string destFileName, bool overwrite)
    {
        if (!IsSafManaged(sourceFileName) && !IsSafManaged(destFileName))
        {
            inner.Move(sourceFileName, destFileName, overwrite);
            return;
        }

        if (Path.GetFullPath(sourceFileName) == Path.GetFullPath(destFileName))
            return;

        if (!Exists(sourceFileName))
            throw new FileNotFoundException(sourceFileName);

        Copy(sourceFileName, destFileName, overwrite);

        if (!Delete(sourceFileName))
            throw new IOException($"Copied to '{destFileName}' but could not delete source '{sourceFileName}'");
    }

    public void CreateDirectory(string path)
    {
        if (!mapper.TryResolve(path, out var treeUri, out var isTree, out var relative))
        {
            inner.CreateDirectory(path);
            return;
        }

        if (!isTree)
            throw new IOException($"Cannot create a directory on a single-document permission, path={path}");

        SafDocument.ResolveOrCreateDirectory(resolver, treeUri, relative);
    }

    public void CreateDirectoryIfAny(string path)
    {
        if (IsSafManaged(path))
        {
            var directoryPath = Path.GetDirectoryName(path);
            if (!string.IsNullOrWhiteSpace(directoryPath))
            {
                CreateDirectory(directoryPath);
            }
            return;
        }
        inner.CreateDirectoryIfAny(path);
    }
}
