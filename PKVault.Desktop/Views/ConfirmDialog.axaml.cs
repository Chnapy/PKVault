using Avalonia.Controls;
using Avalonia.Interactivity;

namespace PKVault.Desktop.Views;

public partial class ConfirmDialog : Window
{
    public ConfirmDialog(string message)
    {
        InitializeComponent();

        Message.Text = message;
    }

    private void Confirm(object? sender, RoutedEventArgs e) {
        // _dialog.Close(true);
    }

    private void Cancel(object? sender, RoutedEventArgs e) {
        // _dialog.Close(false);
    }
}
