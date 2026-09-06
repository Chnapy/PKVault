using Photino.NET;

public interface IFileChooser
{
    public Task<string[]> ShowChooserAsync(PhotinoWindow window, bool directoryOnly, bool multiSelect, string? defaultPath);
}
