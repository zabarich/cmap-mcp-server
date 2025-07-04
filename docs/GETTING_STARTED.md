# Getting Started with CMAP MCP Server

This guide will help you set up and configure the CMAP MCP Server for your organization.

## Prerequisites

- Node.js 18 or higher
- Claude Desktop with MCP support
- CMAP API credentials (see below)

## Step 1: Obtain CMAP Credentials

### For Sandbox Testing
Contact your CMAP administrator and request:
- Client ID
- Client Secret
- Tenant ID
- Confirmation that sandbox access is enabled

### For Production Use
After successful sandbox testing, request production credentials.

## Step 2: Choose Installation Method

### Method A: NPX (Recommended)
No installation required - Claude Desktop will download automatically.

### Method B: Fork and Customize
1. Fork this repository to your organization
2. Update `package.json` with your details
3. Publish to your NPM account

## Step 3: Configure Claude Desktop

Add the MCP server to your Claude Desktop configuration...
[Detailed configuration examples]

## Step 4: Test Connection

Start with basic queries to verify everything works...
[Testing procedures]

## Troubleshooting

[Common issues and solutions]