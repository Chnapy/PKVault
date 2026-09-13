
namespace PKVault.Mobile;

public interface IDirectoryPicker
{
    Task<string?> PickFileAsync(string mimeType = "*/*");
    Task<string?> PickDirectoryAsync();
    IReadOnlyList<string> GetPersistedDirectories();
    void ReleasePersistedDirectory(string uri);
}
