# CMAP MCP Server

A Model Context Protocol (MCP) server that provides natural language access to CMap Professional Services CRM API data through Claude Desktop.

**This is a real working MCP server used in production to connect Claude to CMAP CRM.**

[![npm version](https://badge.fury.io/js/cmap-mcp-server.svg)](https://www.npmjs.com/package/cmap-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Quick Start

1. Get CMAP API credentials from your CMAP administrator
2. Install: `npm install -g cmap-mcp-server` or use with npx
3. Configure environment variables with your credentials
4. Add to Claude Desktop MCP configuration
5. Query your CMAP data in natural language

## What You Can Query

### Business Data Access
- **Companies**: Client companies and prospects in your CRM
- **Projects**: Client projects with financial tracking and resourcing
- **Users**: Team members, consultants, and their assignments
- **Contacts**: Client contacts and stakeholders
- **Financial Data**: Project profitability, budgets, and billing

### Example Natural Language Queries
```
"Show me all active projects over £50,000"
"Which consultants are available next week?"
"Find all contacts at our top clients"
"What's the total value of projects managed by [Project Manager Name]?"
"Show project profitability by client"
"Using cmap, find all active projects with overdue invoices"
```

## Getting CMAP API Credentials

### Sandbox Environment (Recommended for Testing)
1. Contact your CMAP administrator
2. Request sandbox API credentials for testing
3. You'll receive:
   - Client ID
   - Client Secret  
   - Tenant ID
   - Sandbox API URL

### Production Environment
1. Complete sandbox testing first
2. Request production credentials from CMAP administrator
3. Use production API URL in configuration

## Installation Options

### Option 1: NPX (Recommended)
```bash
npx cmap-mcp-server
```

### Option 2: Global Installation
```bash
npm install -g cmap-mcp-server
cmap-mcp-server
```

### Option 3: Fork and Publish Your Own
```bash
# Fork this repository
git clone https://github.com/your-org/cmap-mcp-server.git
cd cmap-mcp-server

# Update package.json with your organization details
# Change name to "@your-org/cmap-mcp-server"

# Install and build
npm install
npm run build

# Publish to your NPM account
npm publish
```

### Option 4: Run from Source
```bash
# Clone the repository
git clone https://github.com/zabarich/cmap-mcp-server.git
cd cmap-mcp-server

# Install dependencies
npm install

# Build the project
npm run build

# Run the MCP server
npx mcp-server .
```

## Configuration

### Environment Variables
Create a `.env` file or set environment variables:

```env
# Required CMAP API credentials (get from your admin)
CMAP_CLIENT_ID=your-cmap-client-id
CMAP_CLIENT_SECRET=your-cmap-client-secret
CMAP_TENANT_ID=your-cmap-tenant-id

# Environment selection
CMAP_BASE_URL=https://api.cmap-sandbox.com  # Sandbox (recommended for testing)
# CMAP_BASE_URL=https://api.cmaphq.com      # Production (use after sandbox testing)
```

### Claude Desktop Integration

Add to your Claude Desktop MCP configuration file:

**For NPX usage:**
```json
{
  "mcpServers": {
    "cmap": {
      "command": "npx",
      "args": ["-y", "cmap-mcp-server"],
      "env": {
        "CMAP_CLIENT_ID": "your-client-id",
        "CMAP_CLIENT_SECRET": "your-client-secret", 
        "CMAP_TENANT_ID": "your-tenant-id",
        "CMAP_BASE_URL": "https://api.cmap-sandbox.com"
      }
    }
  }
}
```

**For your own published version:**
```json
{
  "mcpServers": {
    "cmap": {
      "command": "npx",
      "args": ["-y", "@your-org/cmap-mcp-server"],
      "env": {
        "CMAP_CLIENT_ID": "your-client-id",
        "CMAP_CLIENT_SECRET": "your-client-secret", 
        "CMAP_TENANT_ID": "your-tenant-id",
        "CMAP_BASE_URL": "https://api.cmap-sandbox.com"
      }
    }
  }
}
```

## Testing in Sandbox

### Sandbox Testing Workflow
1. **Request sandbox credentials** from your CMAP administrator
2. **Configure with sandbox URL**: `https://api.cmap-sandbox.com`
3. **Test basic connectivity**: Ask Claude "Can you check CMAP connectivity?"
4. **Verify data access**: Try "List all companies" or "Show me projects"
5. **Test complex queries**: Try relationship-based queries
6. **Validate business logic**: Ensure responses match your expectations

### Safe Sandbox Queries
```
"Test the CMAP connection"
"How many companies are in the system?"
"Show me the project status distribution"
"List the types of users in the system"
```

## Available Tools

| Tool | Description | Use Cases |
|------|-------------|-----------|
| `get_companies` | Retrieve company directory | "Show all clients", "Find consulting firms" |
| `get_projects` | List projects with filters | "Active projects", "Projects over £X" |
| `get_project` | Detailed project information | "Project details for ID X" |
| `get_users` | Team member directory | "List all consultants", "Find available resources" |
| `get_contacts` | Contact directory | "Contacts at company X" |
| `health_check` | Verify API connectivity | "Test CMAP connection" |

## Business Intelligence Examples

### Financial Analysis
```
"What's the total value of all active projects?"
"Show me project profitability by client"
"Which projects are over budget?"
```

### Resource Management
```
"Who's available for new projects next month?"
"Show consultant utilization rates"
"Find team members with specific skills"
```

### Client Relationship Management
```
"Show me our top clients by revenue"
"Find all prospects in the pipeline"
"Which clients have the most active projects?"
```

## Security Best Practices

- **Never commit credentials**: Use environment variables only
- **Start with sandbox**: Always test in sandbox before production
- **Rotate credentials**: Regularly update your API credentials
- **Monitor usage**: Track API calls and unusual activity
- **Limit access**: Only provide credentials to authorized team members

## Troubleshooting

### Common Issues

**"Authentication failed"**
- Verify your credentials are correct
- Check if credentials are for the right environment (sandbox/prod)
- Ensure tenant_id matches your CMAP instance

**"403 Forbidden"**
- Verify tenant_id is included in requests
- Check if your credentials have proper permissions
- Contact CMAP administrator for access verification

**"No data returned"**
- Verify you're querying the correct environment
- Check if your CMAP instance has the expected data
- Try simpler queries first

### Getting Help

1. Check this documentation
2. Review [CMAP API documentation](https://docs.cmaphq.com)
3. Open an issue on GitHub
4. Contact your CMAP administrator for credential issues

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

Richard Wild - [GitHub](https://github.com/zabarich)

## Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic
- [CMap](https://cmap.io) Professional Services CRM Software