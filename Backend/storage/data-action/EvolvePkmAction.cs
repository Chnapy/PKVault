using PKHeX.Core;

public class EvolvePkmAction : DataAction
{
    public uint? saveId { get; }
    private readonly string id;

    public EvolvePkmAction(uint? _saveId, string _id)
    {
        saveId = _saveId;
        id = _id;
    }

    public override DataActionPayload GetPayload()
    {
        return new DataActionPayload
        {
            type = DataActionType.EVOLVE_PKM,
            parameters = [saveId, id]
        };
    }

    public override async Task Execute(DataEntityLoaders loaders)
    {
        if (saveId == null)
        {
            await ExecuteForMain(loaders);
        }
        else
        {
            await ExecuteForSave(loaders, (uint)saveId);
        }
    }

    private async Task ExecuteForSave(DataEntityLoaders loaders, uint saveId)
    {
        var saveLoaders = loaders.saveLoadersDict[saveId];
        var dto = saveLoaders.Pkms.GetDto(id);
        if (dto == default)
        {
            throw new Exception("Save Pkm not found");
        }

        var (evolveSpecies, evolveByItem) = await GetEvolve(dto);

        UpdatePkm(dto.Pkm, evolveSpecies, evolveByItem);

        await saveLoaders.Pkms.WriteDto(dto);
    }

    private async Task ExecuteForMain(DataEntityLoaders loaders)
    {
        var dto = loaders.pkmVersionLoader.GetDto(id);
        if (dto == default)
        {
            throw new Exception("Pkm-version not found");
        }

        var relatedPkmVersions = loaders.pkmVersionLoader.GetAllDtos()
        .FindAll(value => value.PkmDto.Id == dto.PkmDto.Id && value.Id != dto.Id);

        if (
            relatedPkmVersions.Any(version => dto.Species > version.Pkm.MaxSpeciesID)
        )
        {
            throw new Exception($"One of pkm-version cannot evolve, species not compatible with its generation");
        }

        var (evolveSpecies, evolveByItem) = await GetEvolve(dto);

        // main pkm-version has same id than pkm-entity
        var mainDto = dto.IsMain ? dto : relatedPkmVersions.Find(version => version.IsMain);

        // update dto 1/2
        await loaders.pkmVersionLoader.DeleteDto(dto.Id);
        UpdatePkm(dto.Pkm, evolveSpecies, evolveByItem);
        dto.PkmVersionEntity.Id = dto.Id;
        dto.PkmVersionEntity.Filepath = PKMLoader.GetPKMFilepath(dto.Pkm);

        // update related dto 1/2
        await Task.WhenAll(
            relatedPkmVersions.Select(async (versionDto) =>
            {
                await loaders.pkmVersionLoader.DeleteDto(versionDto.Id);
                UpdatePkm(versionDto.Pkm, evolveSpecies, false);
                versionDto.PkmVersionEntity.Id = versionDto.Id;
                versionDto.PkmVersionEntity.Filepath = PKMLoader.GetPKMFilepath(versionDto.Pkm);
            })
        );

        // pkmId to assign to every pkm-version here
        var pkmId = mainDto.Id;

        // update pkm-entity
        mainDto.PkmDto.PkmEntity.Id = pkmId;
        await loaders.pkmLoader.WriteDto(mainDto.PkmDto);

        // update dto 2/2
        dto.PkmVersionEntity.PkmId = pkmId;
        await dto.RefreshHasTradeEvolve();
        await loaders.pkmVersionLoader.WriteDto(dto);

        // update related dto 2/2
        await Task.WhenAll(
            relatedPkmVersions.Select(async (versionDto) =>
            {
                versionDto.PkmVersionEntity.PkmId = pkmId;
                await versionDto.RefreshHasTradeEvolve();
                await loaders.pkmVersionLoader.WriteDto(versionDto);
            })
        );
    }

    private static async Task<(ushort evolveSpecies, bool evolveByItem)> GetEvolve(BasePkmVersionDTO dto)
    {
        if (!dto.CanEvolve)
        {
            throw new Exception("Pkm cannot evolve");
        }

        var evolveChains = await dto.GetTradeEvolveChains();

        var heldItemName = GameInfo.Strings.Item[dto.HeldItem];
        var heldItemPokeapiName = PokeApi.PokeApiNameFromPKHexName(heldItemName);

        var itemEvolveChain = evolveChains.Find(chain => chain.EvolutionDetails.Any(details =>
            details.Trigger.Name == "trade"
            && details.HeldItem != null && details.HeldItem.Name == heldItemPokeapiName));

        var choosenChain = itemEvolveChain ?? evolveChains.Find(chain => chain.EvolutionDetails.Any(details =>
            details.Trigger.Name == "trade" && details.HeldItem == null
        ));

        var evolveName = choosenChain.Species.Name;

        var evolvePkmSpecies = await PokeApi.GetPokemonSpecies(evolveName);
        var evolveSpecies = (ushort)evolvePkmSpecies.Id;

        return (
            evolveSpecies,
            evolveByItem: choosenChain == itemEvolveChain
        );
    }

    private static void UpdatePkm(PKM pkm, ushort evolveSpecies, bool evolveByItem)
    {
        // Console.WriteLine($"EVOLVE TO {evolveSpecies}");

        if (evolveSpecies > pkm.MaxSpeciesID)
        {
            throw new Exception($"Evolve species {evolveSpecies} > pkm.MaxSpecies {pkm.MaxSpeciesID}");
        }

        var currentNickname = SpeciesName.GetSpeciesNameGeneration(pkm.Species, pkm.Language, pkm.Format);
        var isNicknamed = pkm.IsNicknamed && !pkm.Nickname.Equals(currentNickname, StringComparison.InvariantCultureIgnoreCase);

        pkm.Species = evolveSpecies;

        if (evolveByItem)
        {
            pkm.HeldItem = 0;
        }

        if (!isNicknamed)
        {
            pkm.Nickname = SpeciesName.GetSpeciesNameGeneration(pkm.Species, pkm.Language, pkm.Format);
        }

        PkmConvertService.ApplyNicknameToPkm(pkm, pkm.Nickname);

        bool hasPidIssue() => new LegalityAnalysis(pkm).Results.Any(result => !result.Valid && result.Identifier == CheckIdentifier.PID);

        for (var i = 0; i < pkm.PersonalInfo.AbilityCount && hasPidIssue(); i++)
        {
            pkm.RefreshAbility(i);
        }

        pkm.RefreshChecksum();
    }
}
