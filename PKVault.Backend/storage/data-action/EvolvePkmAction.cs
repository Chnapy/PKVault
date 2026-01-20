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

        var (evolveSpecies, evolveByItem) = GetEvolve(dto.Pkm);

        Console.WriteLine($"Evolve from {oldSpecies} to {evolveSpecies} using item? {evolveByItem}");

        dto = dto with
        {
            Pkm = dto.Pkm.Update(pkm =>
        {
            UpdatePkm(pkm, evolveSpecies, evolveByItem);
        })
        };
        saveLoaders.Pkms.WriteDto(dto);

        var pkmVersion = loaders.pkmVersionLoader.GetEntityBySave(dto.SaveId, dto.IdBase);
        if (pkmVersion != null)
        {
            await SynchronizePkmAction.SynchronizeSaveToPkmVersion(pkmConvertService, loaders, flags, Evolves, [(pkmVersion.Id, dto.IdBase)]);
        }

        flags.Dex = true;

        return new(
            type: DataActionType.EVOLVE_PKM,
            parameters: [saveLoaders.Save.Version, oldName, oldSpecies, dto.Species]
        );
    }

    private async Task<DataActionPayload> ExecuteForMain(DataEntityLoaders loaders, DataUpdateFlags flags, string id)
    {
        var entity = loaders.pkmVersionLoader.GetEntity(id) ?? throw new KeyNotFoundException("Pkm-version not found");
        var entityPkm = loaders.pkmVersionLoader.GetPkmVersionEntityPkm(entity);

        var relatedPkmVersions = loaders.pkmVersionLoader.GetEntitiesByBox(entity.BoxId, entity.BoxSlot).Values.ToList()
            .FindAll(value => value.Id != entity.Id)
            .Select(entity => (Version: entity, Pkm: loaders.pkmVersionLoader.GetPkmVersionEntityPkm(entity))).ToList();

        if (
            relatedPkmVersions.Any(version => entityPkm.Species > version.Pkm.MaxSpeciesID)
        )
        {
            throw new ArgumentException($"One of pkm-version cannot evolve, species not compatible with its generation");
        }

        var oldName = entityPkm.Nickname;
        var oldSpecies = entityPkm.Species;

        var (evolveSpecies, evolveByItem) = GetEvolve(entityPkm);

        // update pkm
        entityPkm = entityPkm.Update(pkm =>
        {
            UpdatePkm(pkm, evolveSpecies, evolveByItem);
        });
        loaders.pkmVersionLoader.WriteEntity(
            entity with { Filepath = loaders.pkmVersionLoader.pkmFileLoader.GetPKMFilepath(entityPkm, Evolves) },
            entityPkm
        );

        // update related dto pkm
        relatedPkmVersions.ForEach((version) =>
        {
            version.Pkm = version.Pkm.Update(pkm =>
            {
                UpdatePkm(pkm, evolveSpecies, false);
            });
            loaders.pkmVersionLoader.WriteEntity(
                version.Version with { Filepath = loaders.pkmVersionLoader.pkmFileLoader.GetPKMFilepath(version.Pkm, Evolves) },
                version.Pkm
            );
        });

        if (entity.AttachedSaveId != null)
        {
            await SynchronizePkmAction.SynchronizePkmVersionToSave(pkmConvertService, loaders, flags, [(entity.Id, entity.AttachedSavePkmIdBase!)]);
        }

        new DexMainService(loaders).EnablePKM(entityPkm);

        flags.Dex = true;

        return new DataActionPayload(
            type: DataActionType.EVOLVE_PKM,
            parameters: [null, oldName, oldSpecies, entityPkm.Species]
        );
    }

    private (ushort evolveSpecies, bool evolveByItem) GetEvolve(ImmutablePKM pkm)
    {
        if (Evolves.TryGetValue(pkm.Species, out var staticEvolve))
        {
            if (pkm.HeldItemPokeapiName != null && staticEvolve.TradeWithItem.TryGetValue(pkm.HeldItemPokeapiName, out var evolveMap))
            {
                if (
                    evolveMap.TryGetValue((byte)pkm.Version, out var evolvedSpeciesWithItem)
                    && pkm.CurrentLevel >= evolvedSpeciesWithItem.MinLevel
                )
                {
                    return (evolvedSpeciesWithItem.EvolveSpecies, true);
                }
            }

            if (
                staticEvolve.Trade.TryGetValue((byte)pkm.Version, out var evolvedSpecies)
                && pkm.CurrentLevel >= evolvedSpecies.MinLevel
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
