# Stage 1: Build the React application
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies and additional required packages
RUN npm install && npm install --save react-router-dom lucide-react socket.io-client axios winston

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve the app using lightweight Nginx server
FROM nginx:alpine

# Copy the build output from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]