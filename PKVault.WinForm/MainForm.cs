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

    private async void OnFormLoad(object? sender, EventArgs e)
    {
        var loaded = await WebView_Load();
        if (!loaded) return;

        server = new LocalWebServer();
        await server.Start(args);
        WebView_Navigate();
    }

    protected override async void OnFormClosing(FormClosingEventArgs e)
    {
        if (server != null)
            await server.Stop();
        base.OnFormClosing(e);
    }
}
