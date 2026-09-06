# PKVault.Core.Tests

All PKVault.Core tests.

Dependencies & versions can be found in [PKVault.Core.Tests.csproj](./PKVault.Core.Tests.csproj).

## Test

Basic test process.

```sh
dotnet test
# or
dotnet run
# or
make core-test

# run a single test
dotnet test --filter-class "ClassNameTests"
# or
dotnet run -class "ClassNameTests"
# or
NAME=ClassNameTests make core-test-file
```

## Coverage

First generate coverage.xml file.

```sh
dotnet test -- --coverage --coverage-output-format xml --coverage-output coverage.xml --coverage-settings coverlet.runsettings.xml
```

Then you can generate a report.

```sh
reportgenerator -reports:bin/Debug/net10.0/TestResults/coverage.xml -targetdir:coverage -reporttypes:TextSummary,Markdown,MarkdownSummaryGithub
```

Then reports can be found in coverage/ folder.
