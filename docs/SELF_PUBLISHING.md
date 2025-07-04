# Self-Publishing Guide for CMAP MCP Server

This guide helps organizations fork, customize, and publish their own version of the CMAP MCP Server to NPM.

## Why Self-Publish?

- **Control**: Manage your own deployment timeline and updates
- **Customization**: Add organization-specific features or configurations
- **Security**: Keep your published version under your organization's control
- **Branding**: Use your organization's name and NPM scope

## Prerequisites

- GitHub account for your organization
- NPM account (personal or organization)
- Node.js 18+ installed locally
- Basic familiarity with Git and NPM

## Step 1: Fork and Clone

### 1.1 Fork the Repository
1. Go to https://github.com/your-org/cmap-mcp-server
2. Click "Fork" button
3. Choose your organization account
4. Wait for fork to complete

### 1.2 Clone Your Fork
```bash
git clone https://github.com/YOUR_ORG/cmap-mcp-server.git
cd cmap-mcp-server

# Add upstream for future updates
git remote add upstream https://github.com/original-org/cmap-mcp-server.git
```

## Step 2: Customize Package Configuration

### 2.1 Update package.json
Edit the key fields for your organization:

```json
{
  "name": "@your-org/cmap-mcp-server",
  "description": "CMAP MCP Server for [Your Organization Name]",
  "author": {
    "name": "Your Organization Development Team", 
    "email": "dev-team@your-org.com",
    "url": "https://your-org.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_ORG/cmap-mcp-server.git"
  },
  "homepage": "https://github.com/YOUR_ORG/cmap-mcp-server#readme",
  "bugs": {
    "url": "https://github.com/YOUR_ORG/cmap-mcp-server/issues"
  }
}
```

### 2.2 Update README.md (Optional)
Consider adding organization-specific:
- Installation instructions
- Internal contact information
- Company-specific usage examples
- Internal support channels

### 2.3 Add Organization-Specific Environment Defaults
Create a `.env.example` with your defaults:

```env
# Your Organization's CMAP Configuration
CMAP_CLIENT_ID=your-org-client-id
CMAP_CLIENT_SECRET=your-org-client-secret
CMAP_TENANT_ID=your-org-tenant-id
CMAP_BASE_URL=https://api.cmap-sandbox.com

# Optional: Organization-specific settings
ORG_NAME=Your Organization Name
ORG_ENVIRONMENT=sandbox
```

## Step 3: NPM Publishing Setup

### 3.1 Create NPM Account/Organization
If you don't have one:
1. Go to https://www.npmjs.com/
2. Create account or organization account
3. Verify email address
4. Set up two-factor authentication (recommended)

### 3.2 Login to NPM
```bash
npm login
# Enter your NPM credentials
```

### 3.3 Test Build Process
```bash
# Install dependencies
npm install

# Run build
npm run build

# Test locally
npm start
```

## Step 4: Publish to NPM

### 4.1 Version and Publish
```bash
# Update version (if needed)
npm version patch

# Publish to NPM
npm publish --access public
```

### 4.2 Verify Publication
- Check https://www.npmjs.com/package/@your-org/cmap-mcp-server
- Test installation: `npm install -g @your-org/cmap-mcp-server`

## Step 5: Update Documentation

### 5.1 Update Internal Documentation
Update your organization's documentation with:
- New package name: `@your-org/cmap-mcp-server`
- Installation commands
- Configuration instructions

### 5.2 Update Claude Desktop Configurations
All team members should update their Claude Desktop config:

```json
{
  \"mcpServers\": {
    \"cmap\": {
      \"command\": \"npx\",
      \"args\": [\"-y\", \"@your-org/cmap-mcp-server\"],
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

## Step 6: Keeping Updated with Upstream

### 6.1 Sync with Upstream Changes
```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream changes into your main branch
git checkout main
git merge upstream/main

# Resolve any conflicts if they exist
# ... resolve conflicts ...

# Test the updated code
npm install
npm run build
npm test
```

### 6.2 Publish Updated Version
```bash
# Update version
npm version patch

# Publish update
npm publish
```

## Step 7: Team Deployment

### 7.1 Team Communication
Notify your team about:
- New package name
- Updated installation instructions
- Configuration changes needed

### 7.2 Rollout Strategy
1. **Phase 1**: Deploy to sandbox/testing environments
2. **Phase 2**: Update development team configurations
3. **Phase 3**: Roll out to production users

## Advanced Customization Options

### Custom Features
You can add organization-specific features:
- Custom CMAP tools
- Additional authentication methods
- Organization-specific data transformations
- Custom logging/monitoring

### Example Custom Tool Addition:
```typescript
// In src/index.ts, add your custom tool
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // ... existing tools ...
      {
        name: \"get_org_specific_data\",
        description: \"Retrieve organization-specific CMAP data\",
        inputSchema: {
          type: \"object\",
          properties: {
            // ... your custom parameters
          }
        }
      }
    ]
  };
});
```

## Security Considerations

### 1. Credential Management
- Never commit real credentials to your repository
- Use environment variables for all sensitive data
- Consider using your organization's secret management system

### 2. Access Control
- Limit who can publish updates to NPM
- Use NPM teams to control access
- Enable two-factor authentication for all NPM accounts

### 3. Dependency Security
- Regularly audit dependencies: `npm audit`
- Keep dependencies updated
- Monitor for security vulnerabilities

## Troubleshooting

### Common Issues

**NPM Publish Fails with \"Package already exists\"**
- Check if someone else published this package name
- Try a different organization scope
- Increment version number

**Build Fails After Upstream Merge**
- Check for breaking changes in upstream
- Update dependencies if needed
- Review and resolve TypeScript errors

**Team Members Can't Install**
- Verify NPM package is public
- Check package name spelling
- Ensure team members have NPM access

### Getting Help

1. Check this documentation
2. Review NPM documentation
3. Open issues in your forked repository
4. Contact your DevOps/Platform team

## Automation Options

### GitHub Actions for Auto-Publishing
Create `.github/workflows/publish.yml`:

```yaml
name: Publish to NPM
on:
  release:
    types: [published]
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Dependabot for Dependency Updates
Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: \"npm\"
    directory: \"/\"
    schedule:
      interval: \"monthly\"
```

This guide provides everything needed for organizations to successfully fork, customize, and maintain their own version of the CMAP MCP Server.