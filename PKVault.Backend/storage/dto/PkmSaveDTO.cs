using PKHeX.Core;

public class PkmSaveDTO : BasePkmVersionDTO
{
    public static async Task<PkmSaveDTO> FromPkm(SaveFile save, PKM pkm, int box, int boxSlot,
        EntityLoader<PkmDTO, PkmEntity> pkmLoader,
        EntityLoader<PkmVersionDTO, PkmVersionEntity> pkmVersionLoader
    )
    {
        var dto = new PkmSaveDTO
        {
            Pkm = pkm,
            Save = save,
            Box = box,
            BoxSlot = boxSlot,
        };

        var pkmVersion = await pkmVersionLoader.GetDto(dto.Id);
        if (pkmVersion != null)
        {
            var mainPkm = await pkmLoader.GetDto(pkmVersion.PkmDto.Id);

            if (mainPkm.SaveId == save.ID32)
            {
                dto.PkmVersionId = pkmVersion.Id;
            }
        }

        await dto.RefreshAsyncData();

        return dto;
    }

    public uint SaveId { get { return Save.ID32; } }

    public required int Box { get; set; }

    public required int BoxSlot { get; set; }

    public bool IsShadow { get { return Pkm is IShadowCapture pkmShadow && pkmShadow.IsShadow; } }

    public string? PkmVersionId { get; set; }

    // -- actions

    // public bool CanMoveInBox { get; set; }

    public bool CanMoveToMainStorage { get { return !IsShadow && !IsEgg; } }

    public override bool CanEvolve { get => HasTradeEvolve && PkmVersionId == null; }

    public required SaveFile Save;

    protected override uint GetGeneration()
    {
        return Save.Generation;
    }
}
