using System.Reflection;

public partial class NoWebviewDialog : Form
{
    public NoWebviewDialog()
    {
        InitializeComponent();
    }

    #region Windows Form Designer generated code

    /// <summary>
    /// Required method for Designer support - do not modify
    /// the contents of this method with the code editor.
    /// </summary>
    private void InitializeComponent()
    {
        var assembly = Assembly.GetExecutingAssembly();
        using Stream? iconStream = assembly.GetManifestResourceStream("PKVault.WinForm.wwwroot.icon.ico");

        SuspendLayout();

        var clientSize = new Size(400, 130);
        var padding = 8;

        var textBox = new RichTextBox
        {
            Text = "PKVault requires Microsoft WebView2 runtime.\n\nYou can install it from this link:"
                + "\nhttps://developer.microsoft.com/en-us/microsoft-edge/webview2?form=MA13LH#download"
                + "\n\nThen restart the app.",
            Size = new Size(clientSize.Width - padding * 2, clientSize.Height - padding * 2),
            BorderStyle = BorderStyle.None,
            Left = padding,
            Top = padding,
            BackColor = Color.WhiteSmoke,
        };
        textBox.LinkClicked += (s, e) =>
        {
            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
            {
                FileName = e.LinkText,
                UseShellExecute = true
            });
        };

        // 
        // NoWebviewDialog
        // 
        AutoScaleDimensions = new SizeF(7F, 15F);
        AutoScaleMode = AutoScaleMode.Font;
        ClientSize = clientSize;
        Controls.Add(textBox);
        Name = "NoWebviewDialog";
        Text = "PKVault";
        if (iconStream != null)
            Icon = new Icon(iconStream);

        ResumeLayout(false);
    }

    #endregion
}
