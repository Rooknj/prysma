# This is the base build image for Prysma on RPI
# What this gives you is a QEMU supported environment so you can build ARM images on x86 machines
# This also gives you a prebuilt and installed sqlite3 package since it takes forever to build from source

# Instructions to run: docker build -t rooknj/prysma-base:build .
# Instructions to publish: docker push rooknj/prysma-base:build

# We are using the -build version so that npm does not generate a 
#   Z_INDEX_ERROR: Too far back
FROM balenalib/armv7hf-node:10-stretch-build as builder

# Create app directory
WORKDIR /usr/app

ENV PKG_TARGET="node10-linux-armv7"

# Add app
COPY . .

# Start QEMU support for building on all architectures
RUN [ "cross-build-start" ]

# Install app dependencies
# NOTE: We install sqlite3 and build from source here because
# it takes forever to build from source normally. 
# We specify where sqlite is installed to get it to use those files
RUN install_packages sqlite3
# Specify the exact version of sqlite3 to build here
RUN npm_config_build_from_source=true npm_config_sqlite=/usr/bin yarn add sqlite3@4.0.9 
RUN rm yarn.lock package.json