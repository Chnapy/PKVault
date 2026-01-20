using PKHeX.Core;

public class ImmutablePKMTests : IAsyncLifetime
{
    private Dictionary<ushort, StaticEvolve> evolves;

    public async ValueTask InitializeAsync()
    {
        var client = new AssemblyClient();

        var staticData = (await client.GetAsyncJsonGz(
            GenStaticDataService.GetStaticDataPathParts("en"),
            StaticDataJsonContext.Default.StaticDataDTO
        ))!;
        evolves = staticData.Evolves;
    }

    public async ValueTask DisposeAsync()
    {
        GC.SuppressFinalize(this);
    }

    #region 1. ID stability

    [Fact]
    public void PkmId_ExactFormat()
    {
        var pkm = new ImmutablePKM(new PK3
        {
            Species = 25,
            Form = 0,
            PID = 0x12345678,
            TID16 = 54321,
            IV_HP = 24,
            IV_ATK = 18,
            IV_DEF = 16,
            IV_SPE = 12,
            IV_SPA = 10,
            IV_SPD = 27,
        });

        Assert.Equal(
            "G3_01721234567824 18 16 12 10 2700_54321",
            pkm.GetPKMIdBase(evolves)
        );
    }

    [Fact]
    public void PkmId_ShouldBeStable_ForSamePkm()
    {
        var pkm1 = CreateTestPkm(species: 25); // Pikachu
        var pkm2 = CreateTestPkm(species: 25); // Same

        Assert.Equal(
            pkm1.GetPKMIdBase(evolves),
            pkm2.GetPKMIdBase(evolves)
        );
    }

    [Fact]
    public void PkmId_ShouldDiffer_WhenIVsChange()
    {
        var pkm1 = CreateTestPkm(species: 25, iv_hp: 31);
        var pkm2 = CreateTestPkm(species: 25, iv_hp: 15);

        Assert.NotEqual(
            pkm1.GetPKMIdBase(evolves),
            pkm2.GetPKMIdBase(evolves)
        );
    }

    [Fact]
    public void PkmId_ShouldDiffer_WhenPIDChanges()
    {
        var pkm1 = CreateTestPkm(species: 25, pid: 11111);
        var pkm2 = CreateTestPkm(species: 25, pid: 22222);

        Assert.NotEqual(
            pkm1.GetPKMIdBase(evolves),
            pkm2.GetPKMIdBase(evolves)
        );
    }

    [Fact]
    public void PkmId_ShouldDiffer_WhenTIDChanges()
    {
        var pkm1 = CreateTestPkm(species: 25, tid: 11111);
        var pkm2 = CreateTestPkm(species: 25, tid: 22222);

        Assert.NotEqual(
            pkm1.GetPKMIdBase(evolves),
            pkm2.GetPKMIdBase(evolves)
        );
    }

    #endregion

    #region 2. ID stability with evolution

    [Fact]
    public void PkmId_ShouldStayStable_AfterEvolution()
    {
        var pikachu = CreateTestPkm(species: 25); // Pikachu
        var originalId = pikachu.GetPKMIdBase(evolves);

        var raichu = pikachu.Update(pk =>
        {
            pk.Species = 26; // Raichu
        });

        Assert.Equal(
            pikachu.GetPKMIdBase(evolves),
            raichu.GetPKMIdBase(evolves)
        );
    }

    [Fact]
    public void PkmId_ShouldUseBaseSpecies_ForEvolvedForms()
    {
        var pichu = CreateTestPkm(species: 172);   // Pichu (baby)
        var pikachu = CreateTestPkm(species: 25);  // Pikachu
        var raichu = CreateTestPkm(species: 26);   // Raichu

        var pichuId = pichu.GetPKMIdBase(evolves);

        AssertEqual3(
            pichuId,
            pikachu.GetPKMIdBase(evolves),
            raichu.GetPKMIdBase(evolves)
        );
        Assert.Contains("172", pichuId);
    }

    [Theory]
    [InlineData(280, 281, 282)] // Ralts -> Kirlia -> Gardevoir
    [InlineData(41, 42, 169)] // Zubat -> Golbat -> Crobat
    public void PkmId_ShouldBeConsistent_AcrossEvolutionChain(
        ushort base_species, ushort mid_species, ushort final_species)
    {
        var stage1 = CreateTestPkm(base_species);
        var stage2 = CreateTestPkm(mid_species);
        var stage3 = CreateTestPkm(final_species);

        AssertEqual3(
            stage1.GetPKMIdBase(evolves),
            stage2.GetPKMIdBase(evolves),
            stage3.GetPKMIdBase(evolves)
        );
    }

    #endregion

    #region 3. Special case : 292 - Shedinja

    [Fact]
    public void PkmId_Shedinja_ShouldDifferFromNinjask()
    {
        var nincada = CreateTestPkm(species: 290);  // Nincada
        var ninjask = CreateTestPkm(species: 291);  // Ninjask
        var shedinja = CreateTestPkm(species: 292); // Shedinja

        var ninjaskId = ninjask.GetPKMIdBase(evolves);
        var shedinjaId = shedinja.GetPKMIdBase(evolves);

        Assert.Equal(
            nincada.GetPKMIdBase(evolves),
            ninjaskId
        );
        Assert.NotEqual(
            ninjaskId,
            shedinja.GetPKMIdBase(evolves)
        );
        Assert.Contains("292", shedinjaId);
    }

    #endregion

    #region 4. ID stability with forms

    [Fact]
    public void PkmId_ShouldIgnoreForm_InBaseCalculation()
    {
        var deoxysNormal = CreateTestPkm(species: 386, form: 0);
        var deoxysAttack = CreateTestPkm(species: 386, form: 1);
        var deoxysDefense = CreateTestPkm(species: 386, form: 2);

        AssertEqual3(
            deoxysNormal.GetPKMIdBase(evolves),
            deoxysAttack.GetPKMIdBase(evolves),
            deoxysDefense.GetPKMIdBase(evolves)
        );
    }

    [Fact]
    public void PkmId_Alcremie_ShouldHandleComplexForms()
    {
        // Alcremie has 70 forms (10 creams × 7 sweets)
        var pkm1 = new ImmutablePKM(new PK8 { Species = 869, Form = 0, FormArgument = 0 }); // Vanilla Cream, Strawberry
        var pkm2 = new ImmutablePKM(new PK8 { Species = 869, Form = 0, FormArgument = 1 }); // Vanilla Cream, Berry

        Assert.Equal(
            pkm1.GetPKMIdBase(evolves),
            pkm2.GetPKMIdBase(evolves)
        );
    }

    #endregion

    #region 5. ID stability after PKM update

    [Fact]
    public void PkmId_ShouldChange_AfterStaticUpdate()
    {
        var pkm1 = CreateTestPkm(species: 25);

        var pkm2 = pkm1.Update(pk =>
        {
            pk.PID = 454545;
        });

        Assert.NotEqual(
            pkm1.GetPKMIdBase(evolves),
            pkm2.GetPKMIdBase(evolves)
        );
    }

    [Fact]
    public void PkmId_ShouldStaySame_AfterDynamicUpdate()
    {
        var pkm1 = CreateTestPkm(species: 25);

        var pkm2 = pkm1.Update(pk =>
        {
            pk.Nickname = "CHANGED";
            pk.CurrentLevel = 50;
            pk.EXP = 125000;
            pk.EV_HP = 252;
        });

        Assert.Equal(
            pkm1.GetPKMIdBase(evolves),
            pkm2.GetPKMIdBase(evolves)
        );
    }

    #endregion

    #region 9. Edge Cases

    [Fact]
    public void PkmId_Species0_ShouldHandleGracefully()
    {
        var pkm = new ImmutablePKM(new PK3 { Species = 0 }); // invalid PKM

        Assert.NotEmpty(
            pkm.GetPKMIdBase(evolves)
        );
    }

    #endregion

    private ImmutablePKM CreateTestPkm(ushort species, byte form = 0, uint pid = 12345, int iv_hp = 31, ushort tid = 54321)
    {
        var pk = new PK3
        {
            Species = species,
            Form = form,
            PID = pid,
            TID16 = tid,
            IV_HP = iv_hp,
            IV_ATK = 31,
            IV_DEF = 31,
            IV_SPE = 31,
            IV_SPA = 31,
            IV_SPD = 31,
            Nickname = "TEST",
            OriginalTrainerName = "TRAINER"
        };
        var pkm = new ImmutablePKM(pk);

        Assert.Equal(species, pkm.Species);

        return pkm;
    }

    private void AssertEqual3(string? item1, string? item2, string? item3)
    {
        Assert.All([item2, item3], item => Assert.Equal(item, item1));
    }
}
