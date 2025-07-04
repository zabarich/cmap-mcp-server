# Use Node.js LTS version
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY dist/ ./dist/
COPY LICENSE ./
COPY README.md ./

# Create non-root user
RUN groupadd -r cmapuser && useradd -r -g cmapuser cmapuser
RUN chown -R cmapuser:cmapuser /app
USER cmapuser

# Expose port (if needed for future web interface)
EXPOSE 3000

# Set environment defaults
ENV NODE_ENV=production
ENV CMAP_BASE_URL=https://api.cmap-sandbox.com

# Start the MCP server
CMD ["node", "dist/index.js"]