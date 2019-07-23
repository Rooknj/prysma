[<img src="./images/prysma.png" height="180">](https://github.com/Rooknj/prysma)

# Prysma

[![Build Status](https://travis-ci.org/Rooknj/prysma.svg?branch=master)](https://travis-ci.org/Rooknj/prysma)
[![npm version](https://badge.fury.io/js/prysma.svg)](https://badge.fury.io/js/prysma)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

NodeJS Light Management Service

---

## Installation

### Pre-recs

- Nodejs v10.15.3 or greater is required. Check by running `node -v`
- A Running MQTT broker (default location is localhost:1883. See Configuration section to change)

### Install globally with Yarn or NPM

yarn:

```
yarn global add prysma
prysma
```

npm:

```
npm install -g prysma
prysma
```

## Configuration

Prysma is configurable using environment variables

### Default Configuration

- PORT=80 (or 4001 if NODE_ENV=development)
- MQTT_HOST=localhost
- MQTT_PORT=1883
- MQTT_USERNAME=""
- MQTT_PASSWORD=""
- MQTT_RECONNECT_PERIOD=5000
- TYPEORM_CONNECTION=sqlite
- TYPEORM_DATABASE=[home directory]/.prysma/prysma.db (or [projectRoot]/.prysma/prysma.db if NODE_ENV=development)
- TYPEORM_SYNCHRONIZE=true
- TYPEORM_LOGGING=false

### Overriding default configuration with environment variables

1. Duplicate .env.template and rename to .env
2. Fill in the desired configuration options
3. Note: For overriding TypeORM configurations, make sure you include all required fields for the database you choose to use

### Other configuration variables

View available configuration environment variables in [.env.template](/.env.template).

## Local Development

### Pre-recs

- Nodejs v10.15.3 or greater is required. (Check by running `node -v`)
- Yarn (Check by running `yarn -v`)
- Docker (Check by running `docker -v`) (Used for tests and running an MQTT broker locally)
- Docker-compose (Check by running `docker-compose -v`) (Used for tests and running an MQTT broker locally)

### Install Prysma locally on your computer

```
git clone https://github.com/Rooknj/prysma.git
cd prysma
yarn install
```

### Run Prysma locally

Using environment configuration (specified in .env file) or default configuration options

Note: run `docker-compose up` to start local services (or just use `yarn start --local`)

```
yarn start
```

With an automatically started MQTT broker running on localhost:1883 (Note: This requires docker and docker-compose to be installed)

```
yarn start --local
```

With an MQTT broker running at prysma.local:1883

```
yarn start --remote
```

### Testing

Run tests on watch mode:

```
yarn test
```

Run tests with coverage:

```
yarn test --coverage
```

Run tests once:

```
yarn test --no-watch
```

### Building

Compile Typescript (outputs to /dist)

```
yarn build
```

Compile Typescript and generate an executable using zeit/pkg (executable located in /build)

```
yarn build --createExecutable
```

### Clean temporary Files

```
yarn clean
```

## License

This project is licensed under the terms of the
[MIT license](/LICENSE).
