# Base image
FROM node:14-alpine AS base

# Set the working directory
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Install development dependencies
RUN apk add --no-cache --virtual .build-deps gcc musl-dev
RUN npm ci --only=development

# Copy the application code
COPY . .

# Build the application
RUN npm run build

# Install production dependencies without devDependencies
RUN npm prune --production

# Install the production runtime
FROM node:14-alpine
WORKDIR /app
COPY --from=base /app .
CMD ["npm", "start"]