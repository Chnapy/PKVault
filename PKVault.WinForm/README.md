# PKVault.WinForm

cp -r ../frontend/dist ./wwwroot

dotnet dev-certs https --trust

dotnet run
dotnet publish
