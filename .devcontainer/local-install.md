# Install in local

```sh
wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh

chmod +x ./dotnet-install.sh

./dotnet-install.sh --channel 9.0
```

Setup SSL certificates (required)

```sh
cp .devcontainer/.cert/code.lan+3.pem /usr/local/share/ca-certificates/code.lan+3.crt

update-ca-certificates
```
