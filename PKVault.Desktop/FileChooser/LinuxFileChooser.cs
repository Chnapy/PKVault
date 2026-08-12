using Photino.NET;
using Serilog;

public class LinuxFileChooser : IFileChooser
{
    public LinuxFileChooser()
    {
        // Init is removed since it breaks flatpak version & seems not required otherwise
        // These is a risk of crash with file select on untested linux systems (non-GTK based)

        // Gtk.Application.Init();
    }

    public async Task<string[]> ShowChooserAsync(PhotinoWindow window, bool directoryOnly, bool multiSelect, string? defaultPath)
    {
        var action = directoryOnly
            ? Gtk.FileChooserAction.SelectFolder
            : Gtk.FileChooserAction.Open;

        var title = directoryOnly
            ? "Select a directory"
            : "Select a file";

        Gtk.Window? parentWindow = null;
        // get Photino native GtkWindow, if possible
        try
        {
            parentWindow = Gtk.Window.ListToplevels().OfType<Gtk.Window>().FirstOrDefault(w => w.Visible);
        }
        catch (Exception ex)
        {
            Log.Logger.Warning(ex, $"Failed to get parent window, dialog won't be modal");
        }

        using var chooser = new Gtk.FileChooserNative(
            title,
            parentWindow,
            action,
            "_Open",
            "_Cancel"
        );

        chooser.SelectMultiple = multiSelect;

        if (!string.IsNullOrEmpty(defaultPath))
            chooser.SetCurrentFolder(defaultPath);

        var response = (Gtk.ResponseType)chooser.Run();

        Log.Logger.Debug($"GTK file chooser response = {response} / filenames = {string.Join(',', chooser.Filenames)}");

        return response == Gtk.ResponseType.Accept
            ? chooser.Filenames
            : [];
    }
}
