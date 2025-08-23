using PKHeX.Core;

public class MainMovePkmAction : DataAction
{
    private readonly string id;
    private readonly uint boxId;
    private readonly uint boxSlot;

    public MainMovePkmAction(string _id, uint _boxId, uint _boxSlot)
    {
        id = _id;
        boxId = _boxId;
        boxSlot = _boxSlot;
    }

    public override DataActionPayload GetPayload()
    {
        return new DataActionPayload
        {
            type = DataActionType.MAIN_MOVE_PKM,
            parameters = [id, boxId, boxSlot]
        };
    }

    public override async Task Execute(DataEntityLoaders loaders)
    {
        var dto = loaders.pkmLoader.GetDto(id);
        if (dto == default)
        {
            throw new Exception("Pkm not found");
        }

        var pkmAlreadyPresent = loaders.pkmLoader.GetAllDtos().Find(pkm =>
            pkm.Id != id
            && pkm.BoxId == boxId
            && pkm.BoxSlot == boxSlot
        );
        if (pkmAlreadyPresent != null)
        {
            throw new Exception($"Pkm already present in slot, boxId={boxId}, boxSlot={boxSlot}");
        }

        dto.PkmEntity.BoxId = boxId;
        dto.PkmEntity.BoxSlot = boxSlot;

        await loaders.pkmLoader.WriteDto(dto);
    }
}
