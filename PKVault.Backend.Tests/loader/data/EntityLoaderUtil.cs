using Moq;

public class EntityLoaderUtil
{
    public static Mock<IBankLoader> GetMockBankLoader(
        string filename,
        byte[] content
    )
    {
        Mock<IBankLoader> mockBankLoader = new();
        mockBankLoader.Setup(x => x.FilePath).Returns(filename);
        mockBankLoader.Setup(x => x.SerializeToUtf8Bytes()).Returns(content);
        return mockBankLoader;
    }

    public static Mock<IBoxLoader> GetMockBoxLoader(
        string filename,
        byte[] content
    )
    {
        Mock<IBoxLoader> mockBoxLoader = new();
        mockBoxLoader.Setup(x => x.FilePath).Returns(filename);
        mockBoxLoader.Setup(x => x.SerializeToUtf8Bytes()).Returns(content);
        return mockBoxLoader;
    }

    public static Mock<IPkmLoader> GetMockPkmLoader(
        string filename,
        byte[] content
    )
    {

        Mock<IPkmLoader> mockPkmLoader = new();
        mockPkmLoader.Setup(x => x.FilePath).Returns(filename);
        mockPkmLoader.Setup(x => x.SerializeToUtf8Bytes()).Returns(content);
        return mockPkmLoader;
    }

    public static Mock<IPkmVersionLoader> GetMockPkmVersionLoader(
        string filename,
        byte[] content,
        Dictionary<string, (byte[] Data, PKMLoadError? Error)> pkmFiles
    )
    {
        Mock<IPKMLoader> mockPkmFileLoader = new();
        mockPkmFileLoader.Setup(x => x.GetAllEntities()).Returns(pkmFiles);

        Mock<IPkmVersionLoader> mockPkmVersionLoader = new();
        mockPkmVersionLoader.Setup(x => x.pkmFileLoader).Returns(mockPkmFileLoader.Object);
        mockPkmVersionLoader.Setup(x => x.FilePath).Returns(filename);
        mockPkmVersionLoader.Setup(x => x.SerializeToUtf8Bytes()).Returns(content);
        return mockPkmVersionLoader;
    }

    public static Mock<IDexLoader> GetMockDexLoader(
        string filename,
        byte[] content
    )
    {
        Mock<IDexLoader> mockDexLoader = new();
        mockDexLoader.Setup(x => x.FilePath).Returns(filename);
        mockDexLoader.Setup(x => x.SerializeToUtf8Bytes()).Returns(content);
        return mockDexLoader;
    }
}
