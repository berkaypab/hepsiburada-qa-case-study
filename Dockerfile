FROM mcr.microsoft.com/playwright:v1.58.0-noble

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Run tests by default
CMD ["npx", "playwright", "test"]
