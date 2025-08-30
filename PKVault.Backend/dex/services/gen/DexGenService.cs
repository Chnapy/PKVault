using PKHeX.Core;

public abstract class DexGenService<Save> where Save : SaveFile
{
    public async Task<bool> UpdateDexWithSave(Dictionary<int, Dictionary<uint, DexItemDTO>> dex, Save save)
    {
        var logtime = LogUtil.Time($"Update Dex with save {save.ID32} (save-type={save.GetType().Name}) (max-species={save.MaxSpeciesID})");

        List<Task> tasks = [];
        for (ushort i = 1; i < save.MaxSpeciesID + 1; i++)
        {
            var item = CreateDexItem(i, save, save.ID32);
            dex[i][save.ID32] = item;

            tasks.Add(Task.Run(async () =>
            {
                // if (item.IsAnySeen || item.IsSeenM || item.IsSeenF || item.IsSeenMS || item.IsSeenFS || item.IsCaught || item.IsOwned)
                // {
                await DexGenService<Save>.FillDexItem(item);
                // }
            }));
        }
        await Task.WhenAll(tasks);

        logtime();

        return true;
    }

    protected abstract DexItemDTO CreateDexItem(ushort species, Save save, uint saveId);

    public static async Task FillDexItem(DexItemDTO dto)
    {
        var speciesName = GameInfo.Strings.Species[dto.Species];

        var pkmSpecies = await PokeApi.GetPokemonSpecies(dto.Species);
        var pkmObj = await PokeApi.GetPokemon(dto.Species);

        var stringsFr = PKHexUtils.StringsFR;

        dto.SpeciesName = stringsFr.Species[dto.Species];
        dto.Generation = PokeApi.GetGenerationValue(pkmSpecies.Generation);
        dto.DefaultSprite = pkmObj?.Sprites.FrontDefault;
        dto.ShinySprite = pkmObj?.Sprites.FrontShiny;
        dto.Description = pkmSpecies?.FlavorTextEntries.Find(flavor => flavor.Language.Name == "fr" && flavor.Version.Name == "TODO")?.FlavorText;
        // GameInfo.Strings.gamelist
        dto.Genders = pkmSpecies?.GenderRate switch
        {
            -1 => [],
            0 => [GenderType.MALE],
            8 => [GenderType.FEMALE],
            _ => [GenderType.MALE, GenderType.FEMALE],
        };

        var type1 = stringsFr.Types[dto.Type1];
        var type2 = stringsFr.Types[dto.Type2];
        dto.Types = [.. new List<string>([type1, type2]).Distinct()];

        dto.AbilitiesLabel = [.. dto.Abilities.Select(ability => stringsFr.Ability[ability])];

        if (dto.IsCaught)
        {
            var pkballItem = await PokeApi.GetItem(4);
            dto.BallSprite = pkballItem?.Sprites.Default;
        }
    }
}
