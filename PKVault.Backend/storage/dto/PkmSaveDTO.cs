using PKHeX.Core;

public class PkmSaveDTO : BasePkmVersionDTO
{
    public static async Task<PkmSaveDTO> FromPkm(SaveFile save, PKM pkm, int box, int boxSlot)
    {
        var dto = new PkmSaveDTO
        {
            Pkm = pkm,
            Save = save,
            Box = box,
            BoxSlot = boxSlot,
        };

        await dto.RefreshAsyncData(save);

        return dto;
    }

    public PkmSaveDTO Clone()
    {
        return new()
        {
            Pkm = Pkm,
            Save = Save,
            Box = Box,
            BoxSlot = BoxSlot,
            PkmVersionId = PkmVersionId,
            Sprite = Sprite,
            BallSprite = BallSprite,
            Nature = Nature,
            HasTradeEvolve = HasTradeEvolve
        };
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

    public async Task RefreshPkmVersionId(EntityLoader<PkmDTO, PkmEntity> pkmLoader, EntityLoader<PkmVersionDTO, PkmVersionEntity> pkmVersionLoader)
    {
        PkmVersionId = null;
        var pkmVersion = await pkmVersionLoader.GetDto(Id);
        if (pkmVersion != null)
        {
            var mainPkm = await pkmLoader.GetDto(pkmVersion.PkmDto.Id);

            if (mainPkm.SaveId == Save.ID32)
            {
                PkmVersionId = pkmVersion.Id;
            }
        }
    }

    protected override uint GetGeneration()
    {
        return Save.Generation;
    }
}
