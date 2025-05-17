# Dockerfile for React TypeScript App

# Base image
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Check the build output directory
RUN ls -la

# Production environment
FROM nginx:alpine

# Copy built assets from the build stage - adjust path based on your build output
# For Create React App, it's typically /app/build
# For Vite, it's typically /app/dist
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config to use port 3001
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3001
EXPOSE 3001

# Start nginx
CMD ["nginx", "-g", "daemon off;"]