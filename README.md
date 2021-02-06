# Discord BHT ChatBot

Discord Chat Bot for Communication with BHT Bot Gateway.

## Environment

You need to have a discord token, which can be retrieved in discords developer portal: https://discord.com/developers/applications

copy [.env.example](./.env.example) to `/.env` and fill in your token and Gateway endpoint

## Dockerfile

The bot is meant to be run as a container, provided by [Dockerfile](./Dockerfile) and [docker-compose.yml](./docker-compose.yml)

## Development

All scripts regarding this project are kept inside [package.json](./package.json)

Development watchers can be started with `npm run dev`
