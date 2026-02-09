using System.Text.Json;
using System.Text.Json.Serialization.Metadata;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using System.IO.Compression;
using System.Text;
using PKHeX.Core;
using System.Collections.ObjectModel;
using System.IO.Abstractions;

public interface IFileIOService
{
    public Task<TValue> ReadJSONFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue defaultValue);
    public Task<TValue?> ReadJSONFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo);
    public TValue ReadJSONFileSync<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue defaultValue);
    public IArchive ReadZip(string path);
    public Task<string> ReadText(string path);
    public Task<byte[]> ReadBytes(string path);
    public byte[] ReadBytesSync(string path);
    public Task WriteBytes(string path, byte[] value);
    public Task WriteJSONFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue value);
    public Task WriteJSONGZipFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue value);
    public Task<Image<Rgba32>> ReadImage(string path);
    public (bool TooSmall, bool TooBig) CheckGameFile(string path);
    public bool Exists(string path);
    public DateTime GetLastWriteTime(string path);
    public DateTime GetLastWriteTimeUtc(string path);
    public void Copy(string sourceFileName, string destFileName, bool overwrite);
    public void Move(string sourceFileName, string destFileName, bool overwrite);
    public bool Delete(string path);
    public void CreateDirectory(string path);
    public void CreateDirectoryIfAny(string path);
}

public class FileIOService(IFileSystem fileSystem) : IFileIOService
{
    public TValue ReadJSONFileSync<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue defaultValue)
    {
        path = NormalizePath(path);

        if (!Exists(path))
        {
            return defaultValue;
        }

        var json = fileSystem.File.ReadAllText(path);

        return JsonSerializer.Deserialize(json, jsonTypeInfo) ?? defaultValue;
    }

    public async Task<TValue> ReadJSONFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue defaultValue)
    {
        return await ReadJSONFile(path, jsonTypeInfo) ?? defaultValue;
    }

    public async Task<TValue?> ReadJSONFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo)
    {
        path = NormalizePath(path);

        if (!Exists(path))
        {
            return default;
        }

        using var fileStream = fileSystem.File.OpenRead(path);

        return await JsonSerializer.DeserializeAsync(fileStream, jsonTypeInfo);
    }

    public IArchive ReadZip(string path)
    {
        path = NormalizePath(path);

        var fileStream = fileSystem.File.OpenRead(path);
        var zip = new ZipArchive(fileStream);
        return new Archive(zip, fileSystem);
    }

    public async Task<string> ReadText(string path)
    {
        path = NormalizePath(path);

        return await fileSystem.File.ReadAllTextAsync(path);
    }

    public Task<byte[]> ReadBytes(string path)
    {
        path = NormalizePath(path);

        return fileSystem.File.ReadAllBytesAsync(path);
    }

    public byte[] ReadBytesSync(string path)
    {
        path = NormalizePath(path);

        return fileSystem.File.ReadAllBytes(path);
    }

    public async Task WriteBytes(string path, byte[] value)
    {
        path = NormalizePath(path);

        CreateDirectoryIfAny(path);

        await fileSystem.File.WriteAllBytesAsync(path, value);
    }

    public async Task WriteJSONFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue value)
    {
        path = NormalizePath(path);

        CreateDirectoryIfAny(path);

        using var fileStream = fileSystem.File.Create(path);
        await JsonSerializer.SerializeAsync(
            fileStream,
            value,
            jsonTypeInfo
        );
    }

    public async Task WriteJSONGZipFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue value)
    {
        path = NormalizePath(path);

        CreateDirectoryIfAny(path);

        string json = JsonSerializer.Serialize(value, jsonTypeInfo);

        using var originalFileStream = new MemoryStream(Encoding.UTF8.GetBytes(json));
        using var compressedFileStream = fileSystem.File.Create(path);
        using var compressionStream = new GZipStream(compressedFileStream, CompressionLevel.Optimal);

        await originalFileStream.CopyToAsync(compressionStream);
    }

    public async Task<Image<Rgba32>> ReadImage(string path)
    {
        path = NormalizePath(path);

        using var fileStream = fileSystem.File.OpenRead(path);
        return await Image.LoadAsync<Rgba32>(fileStream);
    }

    public (bool TooSmall, bool TooBig) CheckGameFile(string path)
    {
        path = NormalizePath(path);

        var fi = fileSystem.FileInfo.New(path);

        return (
            TooSmall: FileUtil.IsFileTooSmall(fi.Length),
            TooBig: FileUtil.IsFileTooBig(fi.Length)
        );
    }

    public bool Exists(string path)
    {
        path = NormalizePath(path);

        return fileSystem.File.Exists(path);
    }

    public DateTime GetLastWriteTime(string path)
    {
        path = NormalizePath(path);

        return fileSystem.File.GetLastWriteTime(path);
    }

    public DateTime GetLastWriteTimeUtc(string path)
    {
        path = NormalizePath(path);

        return fileSystem.File.GetLastWriteTimeUtc(path);
    }

    public void Copy(string sourceFileName, string destFileName, bool overwrite)
    {
        sourceFileName = NormalizePath(sourceFileName);
        destFileName = NormalizePath(destFileName);

        fileSystem.File.Copy(sourceFileName, destFileName, overwrite);
    }

    public void Move(string sourceFileName, string destFileName, bool overwrite)
    {
        sourceFileName = NormalizePath(sourceFileName);
        destFileName = NormalizePath(destFileName);

        fileSystem.File.Move(sourceFileName, destFileName, overwrite);
    }

    public bool Delete(string path)
    {
        path = NormalizePath(path);

        if (Exists(path))
        {
            fileSystem.File.Delete(path);
            return true;
        }

        if (fileSystem.Directory.Exists(path))
        {
            fileSystem.Directory.Delete(path, true);
            return true;
        }

        return false;
    }

    public void CreateDirectory(string path)
    {
        path = NormalizePath(path);

        fileSystem.Directory.CreateDirectory(path);
    }

    public void CreateDirectoryIfAny(string path)
    {
        path = NormalizePath(path);

        var directoryPath = Path.GetDirectoryName(path);
        if (!string.IsNullOrWhiteSpace(directoryPath))
        {
            CreateDirectory(directoryPath);
        }
    }

    private string NormalizePath(string path)
    {
        var prefix = SettingsService.GetAppDirectory();

        return path.StartsWith(prefix) ? path : Path.Combine(prefix, path);
    }
}

public interface IArchive : IDisposable
{
    public ReadOnlyCollection<IArchiveEntry> Entries { get; }
}

public interface IArchiveEntry
{
    public string Name { get; }
    public string FullName { get; }

    public void ExtractToFile(string destinationFileName, bool overwrite);
}

public class Archive(ZipArchive archive, IFileSystem fileSystem) : IArchive
{
    public ReadOnlyCollection<IArchiveEntry> Entries => [..archive.Entries
        .Select(entry => new ArchiveEntry(entry, fileSystem))];

    public void Dispose()
    {
        archive.Dispose();
    }
}

public class ArchiveEntry(ZipArchiveEntry entry, IFileSystem fileSystem) : IArchiveEntry
{
    public string Name => entry.Name;
    public string FullName => entry.FullName;

    public void ExtractToFile(string destinationFileName, bool overwrite)
    {
        destinationFileName = NormalizePath(destinationFileName);

        var directoryPath = Path.GetDirectoryName(destinationFileName);
        if (!string.IsNullOrWhiteSpace(directoryPath))
        {
            fileSystem.Directory.CreateDirectory(directoryPath);
        }

        using var fs = fileSystem.FileStream.New(destinationFileName, new FileStreamOptions()
        {
            Access = FileAccess.Write,
            Mode = overwrite ? FileMode.Create : FileMode.CreateNew,
            Share = FileShare.None,
            BufferSize = 0x4000 // 16K
        });
        using var entryStream = entry.Open();
        entryStream.CopyTo(fs);
    }

    private string NormalizePath(string path)
    {
        var prefix = SettingsService.GetAppDirectory();

        return path.StartsWith(prefix) ? path : Path.Combine(prefix, path);
    }
}
