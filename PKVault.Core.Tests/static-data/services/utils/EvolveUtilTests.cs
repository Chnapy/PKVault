using PKHeX.Core;
using PKVault.Core;

/**
 * GetBaseSpecies is already covered indirectly by ImmutablePKMTests.
 */
public class EvolveUtilTests : IAsyncLifetime
{
    private StaticEvolvesData evolves;

    public async ValueTask InitializeAsync()
    {
        evolves = await StaticEvolvesLoader.LoadData();
    }

    public async ValueTask DisposeAsync()
    {
        GC.SuppressFinalize(this);
    }

    [Theory]
    // issue #238: baby dex number
    [InlineData(Species.Magby, Species.Magmar)]
    // multi-hop chain
    [InlineData(Species.Pichu, Species.Raichu)]
    // regular evolution
    [InlineData(Species.Charmander, Species.Charizard)]
    // unchanged species
    [InlineData(Species.Garchomp, Species.Garchomp)]
    public void IsSameOrDescendantOf_AllowsForwardEvolution(Species ancestor, Species species)
    {
        Assert.True(EvolveUtil.IsSameOrDescendantOf(evolves, (ushort)ancestor, (ushort)species));
    }

    [Theory]
    // devolution
    [InlineData(Species.Magmar, Species.Magby)]
    // unrelated species
    [InlineData(Species.Magby, Species.Snorlax)]
    public void IsSameOrDescendantOf_RejectsDevolutionAndUnrelatedSpecies(Species ancestor, Species species)
    {
        Assert.False(EvolveUtil.IsSameOrDescendantOf(evolves, (ushort)ancestor, (ushort)species));
    }
}
