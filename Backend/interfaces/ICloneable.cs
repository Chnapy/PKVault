
public interface ICloneable<T> where T : ICloneable<T>
{
    public T Clone();
}
