namespace PKVault.WinForm;

public partial class MainForm : Form
{
    public MainForm()
    {
        InitializeComponent();
        Resize += new EventHandler(Form_Resize);
        Load += new EventHandler(WebView_Load);
    }
}
