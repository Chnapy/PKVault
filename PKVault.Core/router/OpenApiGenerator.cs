using System.Text.Json;
using Namotion.Reflection;
using NJsonSchema;
using NJsonSchema.Generation;
using NSwag;

namespace PKVault.Core;

public class OpenApiGenerator
{
    public static string GetOpenApiDocument(IEnumerable<CoreRouter.CoreRoute> routes)
    {
        var document = new OpenApiDocument
        {
            Generator = "NSwag v14.6.3.0 (NJsonSchema v11.5.2.0 (Newtonsoft.Json v13.0.0.0))",
            SchemaType = SchemaType.OpenApi3,
            Info = new OpenApiInfo
            {
                Title = "PKVault API",
                Version = "1.0.0"
            },
        };
        document.Servers.Add(new OpenApiServer()
        {
            Url = "http://localhost:5000"
        });

        var settings = new SystemTextJsonSchemaGeneratorSettings()
        {
            DefaultReferenceTypeNullHandling = ReferenceTypeNullHandling.NotNull,

            SerializerOptions = new()
            {
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                TypeInfoResolver = RouteJsonContext.Default
            }
        };
        var schemaResolver = new OpenApiSchemaResolver(document, settings);
        var generator = new JsonSchemaGenerator(settings);

        JsonSchema Resolve(Type type) => generator.GenerateWithReference<JsonSchema>(type.ToContextualType(), schemaResolver);

        foreach (var route in routes.OrderBy(r => r.HttpTemplate))
        {
            var path = "/" + route.HttpTemplate.Trim('/');
            var httpMethod = route.HttpMethod.ToLowerInvariant();

            if (!document.Paths.TryGetValue(path, out var pathItem))
            {
                pathItem = [];
                document.Paths[path] = pathItem;
            }

            var operation = new OpenApiOperation
            {
                Tags = [route.ControllerName],
                OperationId = $"{route.ControllerName}_{route.MethodName}",
            };

            var position = 0;

            foreach (var entry in route.Parameters)
            {
                position++;

                var (Param, Kind) = entry;

                if (Kind == OpenApiParameterKind.Path)
                {
                    operation.Parameters.Add(new OpenApiParameter
                    {
                        Name = Param.Name,
                        Kind = OpenApiParameterKind.Path,
                        IsRequired = true,
                        Schema = Resolve(Param.ParameterType),
                        Position = position
                    });
                }

                else if (Kind == OpenApiParameterKind.Query)
                {
                    var param = new OpenApiParameter
                    {
                        Name = Param.Name,
                        Kind = OpenApiParameterKind.Query,
                        Schema = Resolve(Param.ParameterType),
                        Position = position
                    };

                    var nullable = Param.IsOptional || Nullable.GetUnderlyingType(Param.ParameterType) != null;
                    var required = !Param.HasDefaultValue;

                    if (Param.HasDefaultValue && Param.DefaultValue != null)
                    {
                        param.Schema.Default = Param.DefaultValue;
                        nullable = false;
                    }

                    if (nullable)
                        param.Schema.IsNullableRaw = true;

                    if (required)
                        param.IsRequired = true;

                    if (Param.ParameterType.IsArray)
                    {
                        param.Style = OpenApiParameterStyle.Form;
                        param.Explode = true;
                    }

                    operation.Parameters.Add(param);
                }

                else if (Kind == OpenApiParameterKind.Body)
                {
                    operation.RequestBody = new OpenApiRequestBody
                    {
                        Name = Param.Name,
                        IsRequired = true,
                        Position = position
                    };

                    if (Param.ParameterType == typeof(CoreFile[]))
                    {
                        operation.RequestBody.Content.Add("multipart/form-data", new()
                        {
                            Schema = new JsonSchema()
                            {
                                Type = JsonObjectType.Object,
                                Properties =
                                {
                                    [Param.Name!] = new()
                                    {
                                        Type = JsonObjectType.Array,
                                        Item = new()
                                        {
                                            Type = JsonObjectType.String,
                                            Format = "binary"
                                        }
                                    }
                                }
                            }
                        });
                    }
                    else if (Param.ParameterType == typeof(CoreFile))
                    {
                        operation.RequestBody.Content.Add("multipart/form-data", new()
                        {
                            Schema = new JsonSchema()
                            {
                                Type = JsonObjectType.Object,
                                Properties =
                                {
                                    [Param.Name!] = new()
                                    {
                                        Type = JsonObjectType.String,
                                        Format = "binary"
                                    }
                                }
                            }
                        });
                    }
                    else
                    {
                        operation.RequestBody.Content.Add("application/json", new()
                        {
                            Schema = Resolve(Param.ParameterType)
                        });
                    }
                }
            }

            var responseType = UnwrapReturnType(route.MethodInfo.ReturnType);

            if (responseType == typeof(void))
            {
                operation.Responses["204"] = new OpenApiResponse
                {};
            }
            else if (responseType == typeof(CoreFileResponse))
            {
                operation.Responses["200"] = new OpenApiResponse
                {
                    Description = "",
                    Content =
                    {
                        ["application/octet-stream"] = new OpenApiMediaType
                        {
                            Schema = new()
                            {
                                Type = JsonObjectType.String,
                                Format = "binary"
                            }
                        }
                    }
                };
            }
            else
            {
                operation.Responses["200"] = new OpenApiResponse
                {
                    Description = "",
                    Content =
                    {
                        ["application/json"] = new OpenApiMediaType
                        {
                            Schema = Resolve(responseType)
                        }
                    }
                };
            }

            pathItem[httpMethod] = operation;
        }

        PostProcess(document);

        return document.ToJson();
    }

    // OpenApiDocument post-process,
    // Only if not possible before
    private static void PostProcess(OpenApiDocument doc)
    {
        foreach (var schema in doc.Components.Schemas.Values)
        {
            ProcessSchemaTree(schema);

            foreach (var f in doc.Paths.Values.SelectMany(v => v.Values))
            {
                foreach (var ff in f.Parameters)
                {
                    if (ff.Kind == OpenApiParameterKind.Path)
                        ff.IsNullableRaw = null;
                }
            }

            DedupeEnumValues(schema);
        }
    }

    // Add required: [], with values
    // Remove nullable: true, nullable values being now optional (undefined in frontend)
    // Also handles when type contains "null"
    // and when oneOf contains { type: "null" }
    private static void ProcessSchemaTree(JsonSchema schema)
    {
        if (schema.Properties?.Count > 0)
        {
            var nullableNames = schema.Properties
                .Where(p => IsNullable(p.Value))
                .Select(p => p.Key)
                .ToHashSet();

            foreach (var name in schema.Properties.Keys.Except(nullableNames))
                if (!schema.RequiredProperties.Contains(name))
                    schema.RequiredProperties.Add(name);

            foreach (var property in schema.Properties.Values)
            {
                NormalizeNullable(property);
                if (!property.HasReference)
                    ProcessSchemaTree(property);
            }
        }

        if (schema.Item is not null)
        {
            NormalizeNullable(schema.Item);
            if (!schema.Item.HasReference)
                ProcessSchemaTree(schema.Item);
        }

        foreach (var item in schema.Items)
        {
            NormalizeNullable(item);
            if (!item.HasReference)
                ProcessSchemaTree(item);
        }

        if (schema.AdditionalPropertiesSchema is not null)
        {
            NormalizeNullable(schema.AdditionalPropertiesSchema);
            if (!schema.AdditionalPropertiesSchema.HasReference)
                ProcessSchemaTree(schema.AdditionalPropertiesSchema);
        }

        foreach (var s in schema.AllOf)
            ProcessSchemaTree(s);
    }

    private static void NormalizeNullable(JsonSchema s)
    {
        s.IsNullableRaw = null;

        if (s.Type.HasFlag(JsonObjectType.Null))
            s.Type &= ~JsonObjectType.Null;

        if (s.OneOf.Count > 0)
        {
            var remaining = s.OneOf
                .Where(o => !o.Type.HasFlag(JsonObjectType.Null))
                .ToArray();

            if (remaining.Length > 1)
            {
                s.OneOf.Clear();
                foreach (var r in remaining)
                    s.OneOf.Add(r);
            }
            else if (remaining.Length == 1)
            {
                s.OneOf.Clear();
                var branch = remaining[0];
                if (branch.HasReference)
                    s.Reference = branch.Reference;
                else
                    s.Type = branch.Type;
            }
            else
            {
                throw new Exception($"Case not handled with schema.oneOf without non-null items");
            }
        }
    }

    private static bool IsNullable(JsonSchema s) =>
        s.IsNullable(SchemaType.OpenApi3)
        || s.Type.HasFlag(JsonObjectType.Null)
        || s.OneOf.Any(o => o.Type.HasFlag(JsonObjectType.Null));

    // Dedupe enum values
    // Required for PKHeX.Core.Gender which has duplicates
    private static void DedupeEnumValues(JsonSchema schema)
    {
        if (schema.IsEnumeration)
        {
            var distinctValues = schema.Enumeration.Distinct().ToArray();
            if (distinctValues.Length == schema.Enumeration.Count)
                return;

            schema.Enumeration.Clear();
            foreach (var value in distinctValues)
            {
                schema.Enumeration.Add(value);
            }
        }
    }

    private static Type UnwrapReturnType(Type returnType)
    {
        if (returnType == typeof(Task)) return typeof(void);
        if (returnType.IsGenericType && returnType.GetGenericTypeDefinition() == typeof(Task<>))
            return returnType.GetGenericArguments()[0];
        return returnType;
    }
}
