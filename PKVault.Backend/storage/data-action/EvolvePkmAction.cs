using PKHeX.Core;

public record EvolvePkmActionInput(uint? saveId, string[] ids);

public class EvolvePkmAction(
    IServiceProvider sp,
    PkmConvertService pkmConvertService, StaticDataService staticDataService,
    SynchronizePkmAction synchronizePkmAction,
    IPkmVersionLoader pkmVersionLoader, IPkmFileLoader pkmFileLoader, ISavesLoadersService savesLoadersService
) : DataAction<EvolvePkmActionInput>
{
    protected override async Task<DataActionPayload> Execute(EvolvePkmActionInput input, DataUpdateFlags flags)
    {
        if (input.ids.Length == 0)
        {
            throw new ArgumentException($"Pkm ids cannot be empty");
        }

        async Task<DataActionPayload> act(string id)
        {
            if (input.saveId == null)
            {
                return await ExecuteForMain(flags, id);
            }

            return await ExecuteForSave(flags, (uint)input.saveId, id);
        }

        List<DataActionPayload> payloads = [];
        foreach (var id in input.ids)
        {
            payloads.Add(await act(id));
        }

        return payloads[0];
    }

    private async Task<DataActionPayload> ExecuteForSave(DataUpdateFlags flags, uint saveId, string id)
    {
        var saveLoaders = savesLoadersService.GetLoaders(saveId);
        var dto = saveLoaders.Pkms.GetDto(id);
        if (dto == default)
        {
            throw new ArgumentException("Save Pkm not found");
        }

        var oldName = dto.Nickname;
        var oldSpecies = dto.Species;

        var (evolveSpecies, evolveByItem) = await GetEvolve(dto.Pkm);

        Console.WriteLine($"Evolve from {oldSpecies} to {evolveSpecies} using item? {evolveByItem}");

        dto = dto with
        {
            Pkm = dto.Pkm.Update(pkm =>
        {
            UpdatePkm(pkm, evolveSpecies, evolveByItem);
        })
        };
        saveLoaders.Pkms.WriteDto(dto);

        var pkmVersion = pkmVersionLoader.GetEntityBySave(dto.SaveId, dto.IdBase);
        if (pkmVersion != null)
        {
            await synchronizePkmAction.SynchronizeSaveToPkmVersion(new([(pkmVersion.Id, dto.IdBase)]));
        }

        flags.Dex = true;

        return new(
            type: DataActionType.EVOLVE_PKM,
            parameters: [saveLoaders.Save.Version, oldName, oldSpecies, dto.Species]
        );
    }

    private async Task<DataActionPayload> ExecuteForMain(DataUpdateFlags flags, string id)
    {
        var staticData = await staticDataService.GetStaticData();

        var entity = pkmVersionLoader.GetEntity(id) ?? throw new KeyNotFoundException("Pkm-version not found");
        var entityPkm = pkmVersionLoader.GetPkmVersionEntityPkm(entity);

        var relatedPkmVersions = pkmVersionLoader.GetEntitiesByBox(entity.BoxId, entity.BoxSlot).Values.ToList()
            .FindAll(value => value.Id != entity.Id)
            .Select(entity => (Version: entity, Pkm: pkmVersionLoader.GetPkmVersionEntityPkm(entity))).ToList();

        if (
            relatedPkmVersions.Any(version => entityPkm.Species > version.Pkm.MaxSpeciesID)
        )
        {
            throw new ArgumentException($"One of pkm-version cannot evolve, species not compatible with its generation");
        }

        var oldName = entityPkm.Nickname;
        var oldSpecies = entityPkm.Species;

        var (evolveSpecies, evolveByItem) = await GetEvolve(entityPkm);

        // update pkm
        entityPkm = entityPkm.Update(pkm =>
        {
            UpdatePkm(pkm, evolveSpecies, evolveByItem);
        });
        await pkmVersionLoader.WriteEntity(
            entity with { Filepath = pkmFileLoader.GetPKMFilepath(entityPkm, staticData.Evolves) },
            entityPkm
        );

        // update related dto pkm
        relatedPkmVersions.ForEach((version) =>
        {
            version.Pkm = version.Pkm.Update(pkm =>
            {
                UpdatePkm(pkm, evolveSpecies, false);
            });
            pkmVersionLoader.WriteEntity(
                version.Version with { Filepath = pkmFileLoader.GetPKMFilepath(version.Pkm, staticData.Evolves) },
                version.Pkm
            );
        });

        if (entity.AttachedSaveId != null)
        {
            await synchronizePkmAction.SynchronizePkmVersionToSave(new([(entity.Id, entity.AttachedSavePkmIdBase!)]));
        }

        new DexMainService(sp).EnablePKM(entityPkm);

        flags.Dex = true;

        return new DataActionPayload(
            type: DataActionType.EVOLVE_PKM,
            parameters: [null, oldName, oldSpecies, entityPkm.Species]
        );
    }

    private async Task<(ushort evolveSpecies, bool evolveByItem)> GetEvolve(ImmutablePKM pkm)
    {
        var staticData = await staticDataService.GetStaticData();

        if (staticData.Evolves.TryGetValue(pkm.Species, out var staticEvolve))
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
