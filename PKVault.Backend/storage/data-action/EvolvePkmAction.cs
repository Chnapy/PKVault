using PKHeX.Core;

public class EvolvePkmAction(
    PkmConvertService pkmConvertService,
    Dictionary<ushort, StaticEvolve> Evolves,
    uint? saveId, string[] ids
) : DataAction
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

        var (evolveSpecies, evolveByItem) = GetEvolve(dto);

        Console.WriteLine($"Evolve from {oldSpecies} to {evolveSpecies} using item? {evolveByItem}");

        dto = dto with
        {
            Pkm = dto.Pkm.Update(pkm =>
        {
            UpdatePkm(pkm, evolveSpecies, evolveByItem);
        })
        };
        saveLoaders.Pkms.WriteDto(dto);

        var pkmVersion = loaders.pkmVersionLoader.GetPkmSaveVersion(dto);
        if (pkmVersion != null)
        {
            await SynchronizePkmAction.SynchronizeSaveToPkmVersion(pkmConvertService, loaders, flags, Evolves, [(pkmVersion.PkmId, dto.Id)]);
        }

        flags.Dex = true;

        return new(
            type: DataActionType.EVOLVE_PKM,
            parameters: [saveLoaders.Save.Version, oldName, oldSpecies, dto.Species]
        );
    }

    private async Task<DataActionPayload> ExecuteForMain(DataEntityLoaders loaders, DataUpdateFlags flags, string id)
    {
        var entity = loaders.pkmVersionLoader.GetEntity(id);
        var dto = loaders.pkmVersionLoader.GetDto(id);
        if (dto == default)
        {
            throw new KeyNotFoundException("Pkm-version not found");
        }

        var relatedPkmVersions = loaders.pkmVersionLoader.GetDtosByPkmId(dto.PkmId).Values.ToList()
            .FindAll(value => value.Id != dto.Id);

        if (
            relatedPkmVersions.Any(version => dto.Species > version.Pkm.MaxSpeciesID)
        )
        {
            throw new ArgumentException($"One of pkm-version cannot evolve, species not compatible with its generation");
        }

        var oldName = dto.Nickname;
        var oldSpecies = dto.Species;

        var (evolveSpecies, evolveByItem) = GetEvolve(dto);

        // update dto pkm
        dto = dto with
        {
            Pkm = dto.Pkm.Update(pkm =>
            {
                UpdatePkm(pkm, evolveSpecies, evolveByItem);
            })
        };
        loaders.pkmVersionLoader.WriteEntity(
            entity with { Filepath = loaders.pkmVersionLoader.pkmFileLoader.GetPKMFilepath(dto.Pkm, Evolves) },
            dto.Pkm
        );

        // update related dto pkm
        relatedPkmVersions.ForEach((versionDto) =>
        {
            versionDto = versionDto with
            {
                Pkm = versionDto.Pkm.Update(pkm =>
                {
                    UpdatePkm(pkm, evolveSpecies, false);
                })
            };
            var versionEntity = loaders.pkmVersionLoader.GetEntity(versionDto.Id);
            loaders.pkmVersionLoader.WriteEntity(
                versionEntity with { Filepath = loaders.pkmVersionLoader.pkmFileLoader.GetPKMFilepath(versionDto.Pkm, Evolves) },
                versionDto.Pkm
            );
        });

        var pkmEntity = loaders.pkmLoader.GetEntity(dto.PkmId);
        if (pkmEntity.SaveId != null)
        {
            await SynchronizePkmAction.SynchronizePkmVersionToSave(pkmConvertService, loaders, flags, [(dto.PkmId, null)]);
        }

        new DexMainService(loaders).EnablePKM(dto.Pkm);

        flags.Dex = true;

        return new DataActionPayload(
            type: DataActionType.EVOLVE_PKM,
            parameters: [null, oldName, oldSpecies, dto.Species]
        );
    }

    private (ushort evolveSpecies, bool evolveByItem) GetEvolve(BasePkmVersionDTO dto)
    {
        if (Evolves.TryGetValue(dto.Species, out var staticEvolve))
        {
            if (dto.HeldItemPokeapiName != null && staticEvolve.TradeWithItem.TryGetValue(dto.HeldItemPokeapiName, out var evolveMap))
            {
                if (
                    evolveMap.TryGetValue((byte)dto.Version, out var evolvedSpeciesWithItem)
                    && dto.Level >= evolvedSpeciesWithItem.MinLevel
                )
                {
                    return (evolvedSpeciesWithItem.EvolveSpecies, true);
                }
            }

            if (
                staticEvolve.Trade.TryGetValue((byte)dto.Version, out var evolvedSpecies)
                && dto.Level >= evolvedSpecies.MinLevel
            )
            {
                return (evolvedSpecies.EvolveSpecies, false);
            }
        }

        throw new ArgumentException("Pkm cannot evolve");
    }

    private void UpdatePkm(PKM pkm, ushort evolveSpecies, bool evolveByItem)
    {
        // Console.WriteLine($"EVOLVE TO {evolveSpecies}");

        if (evolveSpecies == 0)
        {
            throw new Exception($"Evolve species not defined");
        }

        var currentNickname = SpeciesName.GetSpeciesNameGeneration(pkm.Species, pkmConvertService.GetPkmLanguage(pkm), pkm.Format);
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
            pkm.Nickname = SpeciesName.GetSpeciesNameGeneration(pkm.Species, pkmConvertService.GetPkmLanguage(pkm), pkm.Format);
        }

        pkmConvertService.ApplyNicknameToPkm(pkm, pkm.Nickname, true);

        pkmConvertService.ApplyAbilityToPkm(pkm);

        pkm.ResetPartyStats();
        pkm.RefreshChecksum();
    }
}
