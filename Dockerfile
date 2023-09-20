
# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build your Nest.js application (compile TypeScript to JavaScript)
RUN npm run build

# Expose the port your Nest.js application will listen on
EXPOSE 3001

# Define the command to run your application
CMD ["npm", "run", "start:prod"]

