# Use a multistage build to reduce the size of the final image, based on the examples found at https://github.com/dotnet/dotnet-docker/tree/main/samples/dotnetapp
FROM mcr.microsoft.com/dotnet/sdk:7.0-alpine3.18-amd64 AS build

COPY . /source

WORKDIR /source

RUN dotnet publish -a x64 --use-current-runtime --self-contained false -o /app

FROM mcr.microsoft.com/dotnet/aspnet:7.0-alpine3.18-amd64 AS final
WORKDIR /app

# Copy everything needed to run the app from the "build" stage.
COPY --from=build /app .

EXPOSE 8000

ENTRYPOINT ["dotnet", "service2.dll"]
