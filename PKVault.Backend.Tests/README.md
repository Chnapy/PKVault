# PKVault.Backend.Tests

All PKVault.Backend tests.

Dependencies & versions can be found in [PKVault.Backend.Tests.csproj](./PKVault.Backend.Tests.csproj).

## Test

Basic test process.

```
dotnet test
```

## Coverage

First generate coverage.xml file.

```
dotnet test -- --coverage --coverage-output-format xml --coverage-output coverage.xml --coverage-settings coverlet.runsettings.xml
```

Then you can generate a report.

```
reportgenerator -reports:bin/Debug/net10.0/TestResults/coverage.xml -targetdir:coverage -reporttypes:TextSummary,Markdown,MarkdownSummaryGithub
```

Reports can be found in coverage/ folder.
