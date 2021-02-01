FROM node:current-alpine

# Install jdk 11
RUN apk update && apk add openjdk11
RUN java --version

# Move into app folder
WORKDIR /app

# Copy dependencies json
COPY package.json .
COPY package-lock.json .

# Copy app source
COPY . .

# Update NPM Install node dependencies
RUN npm install -g npm@latest

# Install node dependencies
RUN npm install && npm audit fix --force

# Entry point
CMD ["npm", "run", "start"]
