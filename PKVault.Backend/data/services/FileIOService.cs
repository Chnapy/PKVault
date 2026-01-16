using System.Text.Json;
using System.Text.Json.Serialization.Metadata;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using System.IO.Compression;
using System.Text;
using PKHeX.Core;
using System.Collections.ObjectModel;

public interface IFileIOService
{
    public TValue ReadJSONFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue defaultValue);
    public TValue? ReadJSONFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo);
    public Task<TValue?> ReadJSONFileAsync<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo);
    public IArchive ReadZip(string path);
    public string ReadText(string path);
    public byte[] ReadBytes(string path);
    public void WriteBytes(string path, byte[] value);
    public Task WriteJSONFileAsync<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue value);
    public string WriteJSONFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue value);
    public void WriteJSONGZipFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue value);
    public Task<Image<Rgba32>> ReadImage(string path);
    public (bool TooSmall, bool TooBig) CheckGameFile(string path);
    public bool Exists(string path);
    public DateTime GetLastWriteTime(string path);
    public DateTime GetLastWriteTimeUtc(string path);
    public bool Delete(string path);
    public void CreateDirectory(string path);
}

public class FileIOService : IFileIOService
{
    public TValue ReadJSONFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue defaultValue)
    {
        return ReadJSONFile(path, jsonTypeInfo) ?? defaultValue;
    }

    public TValue? ReadJSONFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo)
    {
        if (!Exists(path))
        {
            return default;
        }

        string json = File.ReadAllText(path);
        return JsonSerializer.Deserialize(json, jsonTypeInfo);
    }

    public async Task<TValue?> ReadJSONFileAsync<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo)
    {
        if (!Exists(path))
        {
            return default;
        }

        var fileStream = File.OpenRead(path);

        return await JsonSerializer.DeserializeAsync(fileStream, jsonTypeInfo);
    }

    public IArchive ReadZip(string path)
    {
        return new Archive(ZipFile.OpenRead(path));
    }

    public string ReadText(string path)
    {
        return File.ReadAllText(path);
    }

    public byte[] ReadBytes(string path)
    {
        return File.ReadAllBytes(path);
    }

    public void WriteBytes(string path, byte[] value)
    {
        CreateDirectoryIfAny(path);

        File.WriteAllBytes(path, value);
    }

    public async Task WriteJSONFileAsync<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue value)
    {
        CreateDirectoryIfAny(path);

        using var fileStream = File.Create(path);
        await JsonSerializer.SerializeAsync(
            fileStream,
            value,
            jsonTypeInfo
        );
    }

    public string WriteJSONFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue value)
    {
        CreateDirectoryIfAny(path);

        string json = JsonSerializer.Serialize(value, jsonTypeInfo);
        File.WriteAllText(path, json);
        return json;
    }

    public void WriteJSONGZipFile<TValue>(string path, JsonTypeInfo<TValue> jsonTypeInfo, TValue value)
    {
        CreateDirectoryIfAny(path);

        string json = JsonSerializer.Serialize(value, jsonTypeInfo);

        using var originalFileStream = new MemoryStream(Encoding.UTF8.GetBytes(json));
        using var compressedFileStream = File.Create(path);
        using var compressionStream = new GZipStream(compressedFileStream, CompressionLevel.Optimal);

        originalFileStream.CopyTo(compressionStream);
    }

    public async Task<Image<Rgba32>> ReadImage(string path)
    {
        using var fileStream = File.OpenRead(path);
        return await Image.LoadAsync<Rgba32>(fileStream);
    }

    public (bool TooSmall, bool TooBig) CheckGameFile(string path)
    {
        var fi = new FileInfo(path);

        return (
            TooSmall: FileUtil.IsFileTooSmall(fi.Length),
            TooBig: FileUtil.IsFileTooBig(fi.Length)
        );
    }

    public bool Exists(string path)
    {
        return File.Exists(path);
    }

    public DateTime GetLastWriteTime(string path)
    {
        return File.GetLastWriteTime(path);
    }

    public DateTime GetLastWriteTimeUtc(string path)
    {
        return File.GetLastWriteTimeUtc(path);
    }

    public bool Delete(string path)
    {
        if (Exists(path))
        {
            File.Delete(path);
            return true;
        }

        if (Directory.Exists(path))
        {
            Directory.Delete(path, true);
            return true;
        }

        return false;
    }

    public void CreateDirectory(string path)
    {
        Directory.CreateDirectory(path);
    }

    private void CreateDirectoryIfAny(string path)
    {
        var directoryPath = Path.GetDirectoryName(path);
        if (directoryPath != null)
        {
            CreateDirectory(directoryPath);
        }
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

public class Archive(ZipArchive archive) : IArchive
{
    public ReadOnlyCollection<IArchiveEntry> Entries => [..archive.Entries
        .Select(entry => new ArchiveEntry(entry))];

    public void Dispose()
    {
        archive.Dispose();
    }
}

public class ArchiveEntry(ZipArchiveEntry entry) : IArchiveEntry
{
    public string Name => entry.Name;
    public string FullName => entry.FullName;

    public void ExtractToFile(string destinationFileName, bool overwrite) => entry.ExtractToFile(destinationFileName, overwrite);
}
