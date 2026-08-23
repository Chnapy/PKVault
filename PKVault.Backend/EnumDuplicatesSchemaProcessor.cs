using NJsonSchema;
using NJsonSchema.Generation;

public class EnumDuplicatesSchemaProcessor : ISchemaProcessor
{
    public void Process(SchemaProcessorContext context)
    {
        JsonSchema[] schemas = [context.Schema, ..context.Schema.Definitions.Values];

        foreach (var enumSchema in schemas.Where(s => s.IsEnumeration))
        {
            var distinctValues = enumSchema.Enumeration.Distinct().ToArray();
            if (distinctValues.Length == enumSchema.Enumeration.Count)
                continue;

            enumSchema.Enumeration.Clear();
            foreach (var value in distinctValues)
            {
                enumSchema.Enumeration.Add(value);
            }
        }
    }
}
