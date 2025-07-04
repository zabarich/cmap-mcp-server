# Branch Management for ETHOS Internal Use

## Branch Structure

- **main**: Public open source version
- **ethos-internal**: Private ETHOS configurations and customizations
- **development**: Feature development (merges to main)

## Workflow

### For Public Changes
1. Create feature branch from main
2. Make changes (ensure no sensitive data)
3. Merge to main
4. Sync main to ethos-internal branch

### For Internal Changes
1. Work on ethos-internal branch
2. Keep private configurations isolated
3. Cherry-pick public improvements to main

### Syncing Process
```bash
# Update internal branch with public changes
git checkout ethos-internal
git merge main

# Handle conflicts (keep private configs)
git add .
git commit -m "Sync public changes to internal"
```

## Private Configuration Management

- Store all sensitive data in .private/ directory
- Use environment-specific deployment scripts
- Maintain separate Claude Desktop configs
- Never commit real credentials to any branch