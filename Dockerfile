FROM mcr.microsoft.com/playwright:v1.58.2-noble

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Run tests by default
# NOTE: In Docker execution, Chromium needs --ipc=host to avoid memory issues.
# Use --init to prevent zombie processes: docker run --init --ipc=host <image>
CMD ["npx", "playwright", "test"]
