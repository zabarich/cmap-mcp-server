# Docker Deployment Guide

This guide covers deploying the CMAP MCP Server using Docker containers for organizations that prefer containerized deployments.

## Benefits of Docker Deployment

- **Isolation**: Containerized environment prevents conflicts
- **Consistency**: Same runtime environment across development, staging, and production
- **Scalability**: Easy to scale and manage multiple instances
- **Security**: Isolated from host system
- **Portability**: Runs consistently across different platforms

## Prerequisites

- Docker installed on your system
- Docker Compose (included with Docker Desktop)
- CMAP API credentials
- Basic familiarity with Docker

## Quick Start

### 1. Clone and Prepare
```bash
git clone https://github.com/your-org/cmap-mcp-server.git
cd cmap-mcp-server

# Create environment file
cp .env.example .env
```

### 2. Configure Environment
Edit `.env` with your CMAP credentials:
```env
CMAP_CLIENT_ID=your-client-id
CMAP_CLIENT_SECRET=your-client-secret
CMAP_TENANT_ID=your-tenant-id
CMAP_BASE_URL=https://api.cmap-sandbox.com
```

### 3. Build and Run
```bash
# Build the container
docker-compose build

# Run in background
docker-compose up -d

# Check status
docker-compose ps
```

## Deployment Options

### Option 1: Docker Compose (Recommended)

**Benefits**: Easy configuration, automatic restarts, volume management

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart
```

### Option 2: Direct Docker Run

**Benefits**: Direct control, no additional dependencies

```bash
# Build image
docker build -t cmap-mcp-server .

# Run container
docker run -d \\
  --name cmap-mcp-server \\
  --restart unless-stopped \\
  -e CMAP_CLIENT_ID=\"your-client-id\" \\
  -e CMAP_CLIENT_SECRET=\"your-client-secret\" \\
  -e CMAP_TENANT_ID=\"your-tenant-id\" \\
  -e CMAP_BASE_URL=\"https://api.cmap-sandbox.com\" \\
  cmap-mcp-server
```

### Option 3: Docker Swarm

**Benefits**: Multi-node deployment, high availability

```bash
# Initialize swarm (if not already done)
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml cmap-stack

# Check services
docker stack services cmap-stack
```

## Claude Desktop Integration

### For Docker Compose Deployment

Update your Claude Desktop configuration to use the containerized server:

```json
{
  \"mcpServers\": {
    \"cmap\": {
      \"command\": \"docker\",
      \"args\": [\"exec\", \"cmap-mcp-server\", \"node\", \"dist/index.js\"],
      \"env\": {
        \"CMAP_CLIENT_ID\": \"your-client-id\",
        \"CMAP_CLIENT_SECRET\": \"your-client-secret\",
        \"CMAP_TENANT_ID\": \"your-tenant-id\",
        \"CMAP_BASE_URL\": \"https://api.cmap-sandbox.com\"
      }
    }
  }
}
```

### Alternative: Use NPX with Environment Variables

If Docker integration is complex, you can still use NPX while the server runs in Docker for isolation:

```json
{
  \"mcpServers\": {
    \"cmap\": {
      \"command\": \"npx\",
      \"args\": [\"-y\", \"cmap-mcp-server\"],
      \"env\": {
        \"CMAP_CLIENT_ID\": \"your-client-id\",
        \"CMAP_CLIENT_SECRET\": \"your-client-secret\",
        \"CMAP_TENANT_ID\": \"your-tenant-id\",
        \"CMAP_BASE_URL\": \"https://api.cmap-sandbox.com\"
      }
    }
  }
}
```

## Configuration Management

### Environment Variables

All configuration is handled through environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CMAP_CLIENT_ID` | Yes | - | CMAP API Client ID |
| `CMAP_CLIENT_SECRET` | Yes | - | CMAP API Client Secret |
| `CMAP_TENANT_ID` | Yes | - | CMAP Tenant ID |
| `CMAP_BASE_URL` | No | `https://api.cmap-sandbox.com` | CMAP API Base URL |
| `NODE_ENV` | No | `production` | Node.js environment |

### Docker Secrets (Advanced)

For production deployments, use Docker secrets:

```yaml
# docker-compose.yml with secrets
version: '3.8'

services:
  cmap-mcp-server:
    build: .
    secrets:
      - cmap_client_secret
    environment:
      - CMAP_CLIENT_ID_FILE=/run/secrets/cmap_client_id
      - CMAP_CLIENT_SECRET_FILE=/run/secrets/cmap_client_secret
      - CMAP_TENANT_ID_FILE=/run/secrets/cmap_tenant_id

secrets:
  cmap_client_id:
    external: true
  cmap_client_secret:
    external: true
  cmap_tenant_id:
    external: true
```

## Monitoring and Logging

### View Logs
```bash
# Docker Compose
docker-compose logs -f cmap-mcp-server

# Direct Docker
docker logs -f cmap-mcp-server

# With timestamps
docker-compose logs -f -t cmap-mcp-server
```

### Health Checks
```bash
# Check container health
docker-compose ps

# Get detailed health status
docker inspect cmap-mcp-server --format='{{.State.Health.Status}}'
```

### Log Management

Mount logs directory for persistent logging:

```yaml
# In docker-compose.yml
volumes:
  - ./logs:/app/logs
  - ./data:/app/data  # For any persistent data
```

## Production Considerations

### 1. Resource Limits

Set resource limits in docker-compose.yml:

```yaml
services:
  cmap-mcp-server:
    # ... other config
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### 2. Security Hardening

```dockerfile
# In Dockerfile
# Use specific version tags
FROM node:18.17.1-slim

# Run as non-root user
RUN groupadd -r cmapuser && useradd -r -g cmapuser cmapuser
USER cmapuser

# Read-only filesystem
COPY --chown=cmapuser:cmapuser . /app
```

### 3. Backup and Recovery

```bash
# Backup configuration
docker-compose config > backup-compose-$(date +%Y%m%d).yml

# Export container
docker export cmap-mcp-server > cmap-backup-$(date +%Y%m%d).tar
```

## Troubleshooting

### Common Issues

**Container Won't Start**
```bash
# Check logs
docker-compose logs cmap-mcp-server

# Common causes:
# - Missing environment variables
# - Invalid CMAP credentials
# - Port conflicts
```

**Authentication Errors**
```bash
# Verify environment variables are set
docker-compose exec cmap-mcp-server env | grep CMAP

# Test credentials manually
docker-compose exec cmap-mcp-server node -e \"
  console.log('Client ID:', process.env.CMAP_CLIENT_ID);
  console.log('Base URL:', process.env.CMAP_BASE_URL);
\"
```

**Memory Issues**
```bash
# Check container stats
docker stats cmap-mcp-server

# Increase memory limits if needed
```

### Debug Mode

Run container in debug mode:

```bash
# Add debug environment
docker-compose run --rm \\
  -e DEBUG=* \\
  -e NODE_ENV=development \\
  cmap-mcp-server
```

## Scaling and High Availability

### Multiple Instances

```yaml
# docker-compose.yml for multiple instances
version: '3.8'

services:
  cmap-mcp-server:
    build: .
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
```

### Load Balancing

```yaml
# With nginx proxy
services:
  nginx:
    image: nginx:alpine
    ports:
      - \"80:80\"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - cmap-mcp-server

  cmap-mcp-server:
    build: .
    deploy:
      replicas: 3
```

## Updating and Maintenance

### Update Process

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d

# Verify deployment
docker-compose ps
docker-compose logs -f --tail=50
```

### Automated Updates

Create update script:

```bash
#!/bin/bash
# update-cmap-server.sh

echo \"Updating CMAP MCP Server...\"

# Pull latest code
git pull origin main

# Build new image
docker-compose build --no-cache

# Rolling update
docker-compose up -d --force-recreate

echo \"Update complete!\"
```

This Docker deployment guide provides everything needed for organizations to deploy and manage the CMAP MCP Server in containerized environments.