## Build Environment
FROM rooknj/prysma-base:build as builder

# Create app directory
WORKDIR /usr/app

ENV PKG_TARGET="node10-linux-armv7"

# Add app
COPY . .

# Start QEMU support for building on all architectures
RUN [ "cross-build-start" ]

# install deps
RUN yarn install

# Test app
RUN yarn test --no-watch

# Install pkg and Build App
RUN yarn build

## Prod Environment
FROM balenalib/armv7hf:stretch-run

WORKDIR /usr/app

COPY --from=builder /usr/app/build/prysma /usr/app
# Note: We are including the sqlite native module addon here so zeit/pkg can use it
# Native modules can't be included in the executable but can be included in the same directory
COPY --from=builder /usr/app/node_modules/sqlite3/lib/binding/node-v64-linux-arm/node_sqlite3.node /usr/app
# Make port 4001 available to the world outside this container
EXPOSE 4001

# Database is stored in /usr/app/data/.prysma/prysma.db with this env variable
ENV DOCKER=true

# Start the app
ENTRYPOINT ["./prysma"]