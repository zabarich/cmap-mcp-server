#!/bin/bash

# CMAP MCP Server Environment Setup Script
# This script helps set up the environment for CMAP MCP Server

set -e

echo "🚀 CMAP MCP Server Environment Setup"
echo "======================================"

# Check prerequisites
echo "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version is too old. Please upgrade to Node.js 18+."
    echo "   Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v) is installed"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi
echo "✅ npm $(npm -v) is installed"

# Environment selection
echo ""
echo "📋 Environment Setup"
echo "===================="

# Check if .env exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists"
    read -p "Do you want to overwrite it? (y/N): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env file"
        exit 0
    fi
fi

# Create .env file
echo "Creating .env file..."

# Prompt for environment type
echo ""
echo "Select CMAP environment:"
echo "1) Sandbox (recommended for testing)"
echo "2) Production"
read -p "Choose environment (1-2): " env_choice

case $env_choice in
    1)
        BASE_URL="https://api.cmap-sandbox.com"
        echo "🧪 Using Sandbox environment"
        ;;
    2)
        BASE_URL="https://api.cmaphq.com"
        echo "🏭 Using Production environment"
        echo "⚠️  Make sure you have tested in sandbox first!"
        ;;
    *)
        echo "❌ Invalid choice. Using sandbox as default."
        BASE_URL="https://api.cmap-sandbox.com"
        ;;
esac

# Prompt for credentials
echo ""
echo "Enter your CMAP API credentials:"
echo "(Get these from your CMAP administrator)"

read -p "CMAP Client ID: " client_id
if [ -z "$client_id" ]; then
    echo "❌ Client ID is required"
    exit 1
fi

read -s -p "CMAP Client Secret: " client_secret
echo ""
if [ -z "$client_secret" ]; then
    echo "❌ Client Secret is required"
    exit 1
fi

read -p "CMAP Tenant ID: " tenant_id
if [ -z "$tenant_id" ]; then
    echo "❌ Tenant ID is required"
    exit 1
fi

# Create .env file
cat > .env << EOF
# CMAP MCP Server Configuration
# Generated on $(date)

# CMAP API Credentials
CMAP_CLIENT_ID=$client_id
CMAP_CLIENT_SECRET=$client_secret
CMAP_TENANT_ID=$tenant_id

# CMAP Environment
CMAP_BASE_URL=$BASE_URL

# Optional: Additional configuration
# NODE_ENV=production
# DEBUG=cmap:*
EOF

echo ""
echo "✅ Environment configuration saved to .env"

# Install dependencies
echo ""
echo "📦 Installing Dependencies"
echo "========================="

if [ -f "package.json" ]; then
    echo "Installing npm dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "📥 Installing CMAP MCP Server globally..."
    npm install -g cmap-mcp-server
    echo "✅ CMAP MCP Server installed globally"
fi

# Test connection
echo ""
echo "🔗 Testing CMAP Connection"
echo "=========================="

echo "Testing API connection..."

# Create a simple test script
cat > test-connection.js << 'EOF'
const https = require('https');
require('dotenv').config();

const testConnection = async () => {
  const clientId = process.env.CMAP_CLIENT_ID;
  const clientSecret = process.env.CMAP_CLIENT_SECRET;
  const tenantId = process.env.CMAP_TENANT_ID;
  const baseUrl = process.env.CMAP_BASE_URL;

  if (!clientId || !clientSecret || !tenantId || !baseUrl) {
    console.log('❌ Missing required environment variables');
    process.exit(1);
  }

  console.log('🔍 Testing connection to:', baseUrl);
  console.log('🔑 Using tenant:', tenantId);
  
  // Simple test - just check if the API responds
  const url = new URL('/health', baseUrl);
  
  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname,
    method: 'GET',
    headers: {
      'User-Agent': 'CMAP-MCP-Server-Setup'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        console.log('✅ API endpoint is reachable');
        resolve(true);
      } else {
        console.log('⚠️  API returned status:', res.statusCode);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.log('❌ Connection failed:', err.message);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Connection timeout');
      resolve(false);
    });

    req.end();
  });
};

testConnection().then(() => {
  console.log('🎉 Basic connectivity test completed');
}).catch(console.error);
EOF

if command -v node &> /dev/null; then
    node test-connection.js
    rm test-connection.js
fi

# Claude Desktop configuration
echo ""
echo "🔧 Claude Desktop Configuration"
echo "==============================="

echo "Add this configuration to your Claude Desktop MCP settings:"
echo ""

cat << EOF
{
  "mcpServers": {
    "cmap": {
      "command": "npx",
      "args": ["-y", "cmap-mcp-server"],
      "env": {
        "CMAP_CLIENT_ID": "$client_id",
        "CMAP_CLIENT_SECRET": "$client_secret",
        "CMAP_TENANT_ID": "$tenant_id",
        "CMAP_BASE_URL": "$BASE_URL"
      }
    }
  }
}
EOF

echo ""
echo "📝 Configuration saved to examples/claude-desktop-config.json"

# Save the configuration
mkdir -p examples
cat > examples/claude-desktop-config.json << EOF
{
  "mcpServers": {
    "cmap": {
      "command": "npx",
      "args": ["-y", "cmap-mcp-server"],
      "env": {
        "CMAP_CLIENT_ID": "$client_id",
        "CMAP_CLIENT_SECRET": "$client_secret",
        "CMAP_TENANT_ID": "$tenant_id",
        "CMAP_BASE_URL": "$BASE_URL"
      }
    }
  }
}
EOF

# Final instructions
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Copy the configuration above to your Claude Desktop MCP settings"
echo "2. Restart Claude Desktop"
echo "3. Test with: 'Can you check CMAP connectivity?'"
echo ""
echo "For more help, see:"
echo "- README.md - General usage guide"
echo "- docs/GETTING_STARTED.md - Detailed setup guide" 
echo "- docs/SANDBOX_TESTING.md - Testing procedures"
echo ""
echo "🔒 Security reminders:"
echo "- Never commit the .env file to version control"
echo "- Keep your credentials secure"
echo "- Test in sandbox before using production"
echo ""

# Cleanup
if [ -f "test-connection.js" ]; then
    rm test-connection.js
fi