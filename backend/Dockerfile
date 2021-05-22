FROM node:current-alpine

# Move into backend folder
WORKDIR /app

# Copy dependencies json
COPY package.json .
COPY package-lock.json .

# Update NPM Install node dependencies
RUN npm i -g npm@latest

# Install node dependencies
RUN npm i && npm audit fix --force

# Copy backend source
COPY . .

# Entry point
CMD ["npm", "run", "start"]
