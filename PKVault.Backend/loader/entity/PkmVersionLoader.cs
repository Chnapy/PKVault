using PKHeX.Core;

public class PkmVersionLoader : EntityLoader<PkmVersionDTO, PkmVersionEntity>
{
    public readonly PKMMemoryLoader pkmFileLoader;
    private PkmLoader pkmLoader;

    public PkmVersionLoader(
        PkmLoader _pkmLoader
    ) : base(
        filePath: Path.Combine(SettingsService.AppSettings.SettingsMutable.DB_PATH, "pkm-version.json"),
        dictJsonContext: EntityJsonContext.Default.DictionaryStringPkmVersionEntity
    )
    {
        pkmLoader = _pkmLoader;
        pkmFileLoader = new(pkmLoader, [.. GetAllEntities().Values]);
    }

    public override bool DeleteEntity(string id)
    {
        var entityToRemove = GetEntity(id);
        if (entityToRemove == null)
        {
            return false;
        }

        var result = base.DeleteEntity(id);

        pkmFileLoader.DeleteEntity(entityToRemove.Filepath);

        return result;
    }

    public override void WriteDto(PkmVersionDTO dto)
    {
        base.WriteDto(dto);

        pkmFileLoader.WriteEntity(
            PKMLoader.GetPKMBytes(dto.Pkm), dto.Pkm, dto.PkmVersionEntity.Filepath
        );
    }

    public override void WriteToFile()
    {
        base.WriteToFile();

        pkmFileLoader.WriteToFiles();
    }

    protected override PkmVersionDTO GetDTOFromEntity(PkmVersionEntity entity)
    {
        var pkmDto = pkmLoader.GetDto(entity.PkmId);
        var pkm = GetPkmVersionEntityPkm(entity);

        return PkmVersionDTO.FromEntity(entity, pkm, pkmDto!);
    }

    protected override PkmVersionEntity GetEntityFromDTO(PkmVersionDTO dto)
    {
        return dto.PkmVersionEntity;
    }

    private PKM GetPkmVersionEntityPkm(PkmVersionEntity entity)
    {
        var pkmBytes = pkmFileLoader.GetEntity(entity.Filepath);
        var pkm = PKMLoader.CreatePKM(pkmBytes, entity);
        if (pkm == default)
        {
            throw new Exception($"PKM is null, from entity Id={entity.Id} Filepath={entity.Filepath} bytes.length={pkmBytes.Length}");
        }

        return pkm;
    }
}
