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

- A Running MQTT broker

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

## Local Development

- Nodejs v10.15.3 or greater is required. Check by running `node -v`
- yarn
- sqlite v3.28.0

## scripts

- yarn start [--local]
- yarn build [--createExecutable]
- yarn test [--no-watch, --coverage]
- yarn clean

## Common ENV vars (the rest are located in .env.template)

### SERVER CONFIG

- PORT
- NODE_ENV

### MQTT CONFIG

- MQTT_HOST
- MQTT_USERNAME
- MQTT_PASSWORD
- MQTT_PORT

### TYPEORM CONFIG

- TYPEORM_CONNECTION
- TYPEORM_HOST
- TYPEORM_USERNAME
- TYPEORM_PASSWORD
- TYPEORM_DATABASE
- TYPEORM_PORT
- TYPEORM_SYNCHRONIZE=true
- TYPEORM_DROP_SCHEMA
- TYPEORM_LOGGING=false

## License

This project is licensed under the terms of the
[MIT license](/LICENSE).
