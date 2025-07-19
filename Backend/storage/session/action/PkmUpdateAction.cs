using PKHeX.Core;

public class PkmUpdateAction : ListAction<PkmEntity>
{
    public PkmUpdateAction(PkmEntity pkm) : base(pkm)
    {
    }

    public override void Execute(EntityLoader<PkmEntity> pkmLoader)
    {
        if (pkmLoader.GetEntity(item.Id) == null)
        {
            throw new Exception("Pkm not found");
        }

        pkmLoader.WriteEntity(item);
    }
}
