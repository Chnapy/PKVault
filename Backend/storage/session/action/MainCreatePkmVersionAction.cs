
using PKHeX.Core;

public class MainCreatePkmVersionAction
{
    private readonly long pkmId;
    private readonly uint generation;

    public MainCreatePkmVersionAction(long _pkmId, uint _generation)
    {
        pkmId = _pkmId;
        generation = _generation;
    }

    public void Execute(
        EntityLoader<PkmEntity> pkmLoader,
        EntityLoader<PkmVersionEntity> pkmVersionLoader,
        PKMLoader pkmFileLoader
        )
    {
        var pkmEntity = pkmLoader.GetEntity(pkmId);
        if (pkmEntity == default)
        {
            throw new Exception($"Pkm entity not found, id={pkmId}");
        }

        var pkmVersions = pkmVersionLoader.GetAllEntities().FindAll(pkmVersion => pkmVersion.PkmId == pkmId);

        var pkmVersionEntity = pkmVersions.Find(pkmVersion => pkmVersion.Generation == generation);
        if (pkmVersionEntity != default)
        {
            throw new Exception($"Pkm-version already exists, pkm.id={pkmId} generation={generation}");
        }

        var pkmVersionOrigin = pkmVersions.Find(pkmVersion => pkmVersion.Id == pkmId);
        if (pkmVersionOrigin == default)
        {
            throw new Exception($"Pkm-version original not found, pkm.id={pkmId} generation={generation}");
        }

        var pkmOrigin = pkmFileLoader.GetEntity(pkmVersionOrigin)!;

        PKM? target = generation switch
        {
            1 => new PK1(),
            2 => new PK2(),
            3 => new PK3(),
            4 => new PK4(),
            5 => new PK5(),
            _ => default
        };
        if (target == default)
        {
            throw new Exception($"PKM case not found for generation={generation}");
        }

        EntityConverter.AllowIncompatibleConversion = EntityCompatibilitySetting.AllowIncompatibleSane;
        var converted = EntityConverter.TryMakePKMCompatible(
            pkmOrigin,
            target,
            out var result,
            out var pkmConverted
        );

        if (pkmConverted.Species == 0)
        {
            throw new Exception($"PKM converted is not possible, species=0 original.species={pkmOrigin.Species}");
        }

        if (pkmConverted.Species != pkmOrigin.Species)
        {
            throw new Exception($"PKM converted broken, species={pkmConverted.Species} original.species={pkmOrigin.Species}");
        }

        pkmConverted.OriginalTrainerName = pkmOrigin.OriginalTrainerName;
        pkmConverted.OriginalTrainerGender = pkmOrigin.OriginalTrainerGender;

        var filepath = pkmFileLoader.WriteEntity(pkmConverted, null);

        var pkmVersionCreated = new PkmVersionEntity
        {
            Id = PkmSaveDTO.GetPKMId(pkmConverted),
            PkmId = pkmId,
            Generation = generation,
            Filepath = filepath,
        };

        pkmVersionLoader.WriteEntity(pkmVersionCreated);
    }
}
