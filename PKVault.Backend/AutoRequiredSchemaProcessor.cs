using NJsonSchema;
using NJsonSchema.Generation;

public class AutoRequiredSchemaProcessor : ISchemaProcessor
{
    public void Process(SchemaProcessorContext context)
    {
        ProcessSchema(context.Schema);
    }

    private static void ProcessSchema(JsonSchema schema)
    {
        if (schema.Properties != null && schema.Properties.Count > 0)
        {
            var nonNullableProperties = schema.Properties
                .Where(pair => !pair.Value.IsNullable(SchemaType.OpenApi3))
                .Select(pair => pair.Key);

            var nullableProperties = schema.Properties
                .Where(pair => pair.Value.IsNullable(SchemaType.OpenApi3));

            foreach (var p in nonNullableProperties)
            {
                if (!schema.RequiredProperties.Contains(p))
                    schema.RequiredProperties.Add(p);
            }

            foreach (var p in nullableProperties)
            {
                p.Value.IsNullableRaw = null;
            }
        }

        foreach (var s in schema.AllOf)
        {
            ProcessSchema(s);
        }
    }
}
