namespace PKVault.WinForm;

public partial class MainForm : Form
{
    private readonly string[] args;
    private readonly Func<long> fullStartupTime;
    private readonly Func<long> partialStartupTime;
    private LocalWebServer? server;

    public MainForm(string[] _args, Func<long> _fullStartupTime, Func<long> _partialStartupTime)
    {
        args = _args;
        fullStartupTime = _fullStartupTime;
        partialStartupTime = _partialStartupTime;

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

        var serverTime = LogUtil.Time($"Start LocalWebServer");

        server = new LocalWebServer();
        await server.Start(args);

        serverTime();

        WebView_Navigate();
    }

    protected override async void OnFormClosing(FormClosingEventArgs e)
    {
        if (server != null)
            await server.Stop();
        base.OnFormClosing(e);
    }
}
