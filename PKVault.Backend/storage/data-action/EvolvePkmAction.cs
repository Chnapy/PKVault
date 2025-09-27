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

    public override async Task Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        if (saveId == null)
        {
            await ExecuteForMain(loaders, flags);
        }
        else
        {
            await ExecuteForSave(loaders, flags, (uint)saveId);
        }
    }

    private async Task ExecuteForSave(DataEntityLoaders loaders, DataUpdateFlags flags, uint saveId)
    {
        var saveLoaders = loaders.saveLoadersDict[saveId];
        var dto = await saveLoaders.Pkms.GetDto(id);
        if (dto == default)
        {
            throw new ArgumentException("Save Pkm not found");
        }

        var (evolveSpecies, evolveByItem) = await GetEvolve(dto);

        await saveLoaders.Pkms.DeleteDto(dto.Id);

        UpdatePkm(dto.Pkm, evolveSpecies, evolveByItem);

        await saveLoaders.Pkms.WriteDto(dto);

        flags.Saves.Add(new()
        {
            SaveId = saveId,
            SavePkms = true
        });
        flags.Dex = true;
    }

    private async Task ExecuteForMain(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var dto = await loaders.pkmVersionLoader.GetDto(id);
        if (dto == default)
        {
            throw new KeyNotFoundException("Pkm-version not found");
        }

        var relatedPkmVersions = (await loaders.pkmVersionLoader.GetAllDtos())
        .FindAll(value => value.PkmDto.Id == dto.PkmDto.Id && value.Id != dto.Id);

        if (
            relatedPkmVersions.Any(version => dto.Species > version.Pkm.MaxSpeciesID)
        )
        {
            throw new ArgumentException($"One of pkm-version cannot evolve, species not compatible with its generation");
        }

        var (evolveSpecies, evolveByItem) = await GetEvolve(dto);

        // main pkm-version has same id than pkm-entity
        var mainDto = dto.IsMain ? dto : relatedPkmVersions.Find(version => version.IsMain);

        // update dto 1/2
        loaders.pkmVersionLoader.DeleteEntity(dto.Id);
        UpdatePkm(dto.Pkm, evolveSpecies, evolveByItem);
        dto.PkmVersionEntity.Id = dto.Id;
        dto.PkmVersionEntity.Filepath = PKMLoader.GetPKMFilepath(dto.Pkm);

        // update related dto 1/2
        relatedPkmVersions.ForEach((versionDto) =>
        {
            loaders.pkmVersionLoader.DeleteEntity(versionDto.Id);
            UpdatePkm(versionDto.Pkm, evolveSpecies, false);
            versionDto.PkmVersionEntity.Id = versionDto.Id;
            versionDto.PkmVersionEntity.Filepath = PKMLoader.GetPKMFilepath(versionDto.Pkm);
        });

        // pkmId to assign to every pkm-version here
        var pkmId = mainDto.Id;

        // update pkm-entity
        mainDto.PkmDto.PkmEntity.Id = pkmId;
        loaders.pkmLoader.WriteDto(mainDto.PkmDto);

        // update dto 2/2
        dto.PkmVersionEntity.PkmId = pkmId;
        loaders.pkmVersionLoader.WriteDto(dto);

        // update related dto 2/2
        relatedPkmVersions.ForEach((versionDto) =>
        {
            versionDto.PkmVersionEntity.PkmId = pkmId;
            loaders.pkmVersionLoader.WriteDto(versionDto);
        });

        flags.MainPkms = true;
        flags.MainPkmVersions = true;
    }

    private static async Task<(ushort evolveSpecies, bool evolveByItem)> GetEvolve(BasePkmVersionDTO dto)
    {
        if (!dto.CanEvolve)
        {
            throw new ArgumentException("Pkm cannot evolve");
        }

        var evolveChains = await dto.GetTradeEvolveChains(
            SaveUtil.GetBlankSAV(dto.Pkm.Context, "")
        );

        var heldItemName = GameInfo.Strings.Item[dto.HeldItem];
        var heldItemPokeapiName = StaticDataService.GetPokeapiItemName(heldItemName);

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

        var currentNickname = SpeciesName.GetSpeciesNameGeneration(pkm.Species, pkm.Language, pkm.Format);
        var isNicknamed = pkm.IsNicknamed && !pkm.Nickname.Equals(currentNickname, StringComparison.InvariantCultureIgnoreCase);

        if (pkm.Species == evolveSpecies)
        {
            throw new Exception($"Same species: {evolveSpecies}");
        }

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

        PkmConvertService.ApplyAbilityToPkm(pkm);

        pkm.RefreshChecksum();
    }
}
