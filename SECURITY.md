# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

1. **Do NOT** open a public issue
2. Email security concerns to: richard.wild@ethos.co.im
3. Include detailed information about the vulnerability
4. Allow reasonable time for response before public disclosure

## Security Guidelines

### For Users

- Never commit CMAP credentials to version control
- Use environment variables for all sensitive configuration
- Regularly rotate your CMAP API credentials
- Use sandbox environment for testing
- Keep dependencies updated

### For Contributors

- Audit code for potential credential leakage
- Use secure coding practices
- Validate all user inputs
- Follow the principle of least privilege
- Document security considerations in PRs

## Credential Management

### Environment Variables
```bash
# Required CMAP credentials
CMAP_CLIENT_ID=your-client-id
CMAP_CLIENT_SECRET=your-client-secret
CMAP_TENANT_ID=your-tenant-id
CMAP_BASE_URL=https://api.cmap-sandbox.com
```

### Best Practices
- Use `.env` files (never commit them)
- Rotate credentials regularly
- Use different credentials for different environments
- Monitor for credential exposure in logs

## Known Security Considerations

- OAuth2 tokens are cached temporarily in memory
- Network communications use HTTPS
- No credentials are logged or stored persistently

## Updates

Security updates will be released promptly. Subscribe to releases for notifications.