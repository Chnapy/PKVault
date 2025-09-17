# Install in local

```sh
wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh

chmod +x ./dotnet-install.sh

./dotnet-install.sh --channel 9.0
```

Setup SSL certificates (required)

```sh
cp .devcontainer/.cert/localhost+2.crt /usr/local/share/ca-certificates/localhost+2.crt

update-ca-certificates
```

Note that these certificates are given for reference, you may have to use your own certs.
