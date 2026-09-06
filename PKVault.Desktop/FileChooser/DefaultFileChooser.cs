using Photino.NET;
using Serilog;

public class DefaultFileChooser : IFileChooser
{
    public async Task<string[]> ShowChooserAsync(PhotinoWindow window, bool directoryOnly, bool multiSelect, string? defaultPath)
    {
        if (directoryOnly)
        {
            Log.Logger.Debug($"Directory only");
            return await window.ShowOpenFolderAsync(
                defaultPath: defaultPath,
                multiSelect: multiSelect
            );
        }

        Log.Logger.Debug($"File only");
        return await window.ShowOpenFileAsync(
            defaultPath: defaultPath,
            multiSelect: multiSelect
        );
    }
}
