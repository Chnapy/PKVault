namespace PKVault.WinForm;

public partial class MainForm : Form
{
    private readonly string[] args;
    private LocalWebServer? server;

    public MainForm(string[] _args)
    {
        args = _args;

        try
        {
            InitializeComponent();
        }
        catch (Exception error)
        {
            Console.WriteLine(error);
        }

        Resize += new EventHandler(Form_Resize);
        Load += new EventHandler(OnFormLoad);
    }

    private void OnFormLoad(object? sender, EventArgs e)
    {
        WebView_Load(sender, e);

        server = new LocalWebServer();
        server.Start(args);
    }

    protected override async void OnFormClosing(FormClosingEventArgs e)
    {
        if (server != null)
            await server.Stop();
        base.OnFormClosing(e);
    }
}
