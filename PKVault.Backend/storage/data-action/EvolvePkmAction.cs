using PKHeX.Core;

public class EvolvePkmAction(uint? saveId, string[] ids) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        if (ids.Length == 0)
        {
            throw new ArgumentException($"Pkm ids cannot be empty");
        }

        async Task<DataActionPayload> act(string id)
        {
            if (saveId == null)
            {
                return await ExecuteForMain(loaders, flags, id);
            }

            return await ExecuteForSave(loaders, flags, (uint)saveId, id);
        }

        List<DataActionPayload> payloads = [];
        foreach (var id in ids)
        {
            payloads.Add(await act(id));
        }

        return payloads[0];
    }

    private async Task<DataActionPayload> ExecuteForSave(DataEntityLoaders loaders, DataUpdateFlags flags, uint saveId, string id)
    {
        var saveLoaders = loaders.saveLoadersDict[saveId];
        var dto = saveLoaders.Pkms.GetDto(id);
        if (dto == default)
        {
            throw new ArgumentException("Save Pkm not found");
        }

        var oldName = dto.Nickname;
        var oldSpecies = dto.Species;

        var (evolveSpecies, evolveByItem) = await GetEvolve(dto);

        saveLoaders.Pkms.DeleteDto(dto.Id);

        UpdatePkm(dto.Pkm, evolveSpecies, evolveByItem);

        saveLoaders.Pkms.WriteDto(dto);

        flags.Saves.Add(new()
        {
            SaveId = saveId,
            SavePkms = true
        });
        flags.Dex = true;

        return new()
        {
            type = DataActionType.EVOLVE_PKM,
            parameters = [saveLoaders.Save.Version, oldName, oldSpecies, dto.Species]
        };
    }

    private async Task<DataActionPayload> ExecuteForMain(DataEntityLoaders loaders, DataUpdateFlags flags, string id)
    {
        var dto = loaders.pkmVersionLoader.GetDto(id);
        if (dto == default)
        {
            throw new KeyNotFoundException("Pkm-version not found");
        }

        var relatedPkmVersions = loaders.pkmVersionLoader.GetAllDtos()
        .FindAll(value => value.PkmDto.Id == dto.PkmDto.Id && value.Id != dto.Id);

        if (
            relatedPkmVersions.Any(version => dto.Species > version.Pkm.MaxSpeciesID)
        )
        {
            throw new ArgumentException($"One of pkm-version cannot evolve, species not compatible with its generation");
        }

        var oldName = dto.Nickname;
        var oldSpecies = dto.Species;

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
        var pkmId = mainDto!.Id;

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

        return new DataActionPayload
        {
            type = DataActionType.EVOLVE_PKM,
            parameters = [null, oldName, oldSpecies, dto.Species]
        };
    }

    private static async Task<(ushort evolveSpecies, bool evolveByItem)> GetEvolve(BasePkmVersionDTO dto)
    {
        var staticData = await StaticDataService.GetStaticData();

        if (staticData.Evolves.TryGetValue(dto.Species, out var staticEvolve))
        {
            if (dto.HeldItemPokeapiName != null && staticEvolve.TradeWithItem.TryGetValue(dto.HeldItemPokeapiName, out var evolveMap))
            {
                if (evolveMap.TryGetValue((byte)dto.Version, out var evolvedSpeciesWithItem))
                {
                    return ((ushort)evolvedSpeciesWithItem, true);
                }
            }

            if (staticEvolve.Trade.TryGetValue((byte)dto.Version, out var evolvedSpecies))
            {
                return ((ushort)evolvedSpecies, false);
            }
        }

        throw new ArgumentException("Pkm cannot evolve");
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
