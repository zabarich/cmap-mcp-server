# CMAP MCP Server Release Notes

## Version 1.0.0 - Initial Release

Released: July 4, 2025  
Author: Richard Wild

### Overview

First public release of the CMAP MCP Server, providing Model Context Protocol integration for CMap Professional Services CRM. This release enables natural language queries to CMap API data through Claude Desktop.

### Features

- Natural language interface to CMap CRM data
- Complete API coverage for companies, projects, users, and contacts
- Financial and resource management queries
- OAuth2 authentication with automatic token refresh
- Multiple deployment options (NPX, Docker, self-hosting)
- Comprehensive documentation for professional services firms

### Technical Details

- Node.js 18+ runtime requirement
- TypeScript implementation with full type safety
- MCP SDK integration following Anthropic standards
- Environment-based configuration
- Production-ready error handling

### Deployment Options

1. NPX installation for quick setup
2. Docker containerization for isolated deployments
3. Fork and publish workflow for customized versions
4. Global npm installation for system-wide access

### Security

- No credentials stored in code
- Environment variable configuration
- Comprehensive .gitignore for credential protection
- Security policy and vulnerability reporting process

### Documentation

- README with setup and usage instructions
- Getting started guide for new users
- Sandbox testing procedures
- Self-publishing guide for organizations
- Docker deployment documentation

### Known Limitations

- Requires valid CMap API credentials
- Sandbox environment recommended for initial testing
- API rate limits apply based on CMap subscription

### Future Considerations

- Additional CMap API endpoint coverage as they become available
- Enhanced query capabilities based on user feedback
- Performance optimizations for large datasets

---

For installation and usage instructions, see README.md