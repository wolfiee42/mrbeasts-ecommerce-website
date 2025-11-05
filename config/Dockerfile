FROM kong:3.4

USER root

# Install Node.js and npm
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install kong-js-pluginserver globally
RUN npm install -g kong-pdk@0.5.5

# Create plugins directory
RUN mkdir -p /usr/local/kong/js-plugins

# Install plugin dependencies
COPY plugins/package.json /usr/local/kong/js-plugins/
WORKDIR /usr/local/kong/js-plugins
RUN npm install

# Copy plugin files (not entire directory to avoid node_modules conflict)
COPY plugins/oidc.js /usr/local/kong/js-plugins/

USER kong

WORKDIR /

