## Build Environment
# The latest LTS version of node
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
RUN npm install sqlite3 --build-from-source --sqlite=/usr/bin
RUN npm install

# Test app
RUN npm run test -- --no-watch

# Install pkg and Build App
RUN npm run build

## Prod Environment
FROM balenalib/armv7hf:stretch-run

WORKDIR /usr/app
RUN mkdir data

COPY --from=builder /usr/app/build/prysma /usr/app
# Note: We are including the sqlite native module addon here so zeit/pkg can use it
# Native modules can't be included in the executable but can be included in the same directory
COPY --from=builder /usr/app/node_modules/sqlite3/lib/binding/node-v64-linux-arm/node_sqlite3.node /usr/app
# Make port 4001 available to the world outside this container
EXPOSE 4001

# Start the app
CMD ./prysma