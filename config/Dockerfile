FROM kong:3.4

USER root

# Install Node.js and npm
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create plugins directory
RUN mkdir -p /usr/local/kong/js-plugins

# Install plugin dependencies (including kong-pdk and kong-js-pluginserver)
COPY plugins/package.json /usr/local/kong/js-plugins/
WORKDIR /usr/local/kong/js-plugins
RUN npm install

# Copy plugin files (not entire directory to avoid node_modules conflict)
COPY plugins/oidc.js /usr/local/kong/js-plugins/

# Install kong-js-pluginserver globally from the local node_modules
RUN npm install -g /usr/local/kong/js-plugins/node_modules/kong-pdk/pluginserver/

USER kong

WORKDIR /

