using PKHeX.Core;

public abstract class ListAction<D> where D : IWithId
{
    protected D item;

    public ListAction(D _item)
    {
        item = _item;
    }

    public abstract void Execute(EntityLoader<D> list);
}
