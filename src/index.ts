#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { CMapClient } from './cmap-client.js';
import dotenv from 'dotenv';

dotenv.config();

const server = new Server(
  {
    name: 'cmap-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

let cmapClient: CMapClient;

// Initialize CMAP client
async function initializeCMapClient() {
  const config = {
    clientId: process.env.CMAP_CLIENT_ID!,
    clientSecret: process.env.CMAP_CLIENT_SECRET!,
    tenantId: process.env.CMAP_TENANT_ID!,
    baseUrl: process.env.CMAP_BASE_URL || 'https://api.cmap-sandbox.com',
  };

  if (!config.clientId || !config.clientSecret || !config.tenantId) {
    throw new Error('Missing required CMAP credentials in environment variables');
  }

  cmapClient = new CMapClient(config);
  await cmapClient.authenticate();
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_companies',
        description: 'Get all companies from CMAP',
        inputSchema: {
          type: 'object',
          properties: {
            page: { type: 'number', description: 'Page number (default: 1)', default: 1 },
            per_page: { type: 'number', description: 'Items per page (default: 100)', default: 100 },
          },
        },
      },
      {
        name: 'get_projects',
        description: 'Get all projects from CMAP',
        inputSchema: {
          type: 'object',
          properties: {
            page: { type: 'number', description: 'Page number (default: 1)', default: 1 },
            per_page: { type: 'number', description: 'Items per page (default: 100)', default: 100 },
            status: { type: 'string', description: 'Project status filter (default: Project)', enum: ['Potential', 'Project', 'Closed'], default: 'Project' },
            query: { type: 'string', description: 'Search query (default: space)', default: ' ' },
          },
        },
      },
      {
        name: 'get_contacts',
        description: 'Get contacts with optional company filter',
        inputSchema: {
          type: 'object',
          properties: {
            page: { type: 'number', description: 'Page number (default: 1)', default: 1 },
            per_page: { type: 'number', description: 'Items per page (default: 100)', default: 100 },
            company_id: { type: 'string', description: 'Optional: Company ID to filter contacts' },
          },
        },
      },
      {
        name: 'get_users',
        description: 'Get users from CMAP',
        inputSchema: {
          type: 'object',
          properties: {
            page: { type: 'number', description: 'Page number (default: 1)', default: 1 },
            per_page: { type: 'number', description: 'Items per page (default: 100)', default: 100 },
          },
        },
      },
      {
        name: 'get_project',
        description: 'Get detailed information for a specific project by ID',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: { type: 'string', description: 'Project ID to retrieve detailed information for' },
          },
          required: ['project_id'],
        },
      },
      {
        name: 'health_check',
        description: 'Check CMAP API connectivity and authentication',
        inputSchema: { type: 'object', properties: {} },
      },
    ],
  };
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'cmap://api-schema',
        name: 'CMAP API Schema & Relationships',
        description: 'Complete CMAP API structure with foreign key relationships',
        mimeType: 'application/json',
      },
      {
        uri: 'cmap://query-examples',
        name: 'Common Query Patterns',
        description: 'Examples of multi-table queries and aggregations',
        mimeType: 'text/markdown',
      },
    ],
  };
});

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case 'cmap://api-schema':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              entities: {
                companies: {
                  primaryKey: 'id',
                  fields: ['id', 'name'],
                  relationships: {
                    projects: 'companies.id = projects.CompanyID',
                    contacts: 'companies.id = contacts.companyId'
                  }
                },
                projects: {
                  primaryKey: 'id', 
                  fields: ['id', 'title', 'code', 'CompanyID', 'TotalProjectValue', 'Owner', 'ProjectManager'],
                  relationships: {
                    company: 'projects.CompanyID = companies.id',
                    owner: 'projects.Owner = users.firstname + " " + users.lastname',
                    manager: 'projects.ProjectManager = users.firstname + " " + users.lastname'
                  }
                },
                users: {
                  primaryKey: 'id',
                  fields: ['id', 'firstname', 'lastname', 'email', 'jobTitle'],
                  relationships: {
                    projects_owned: 'users.firstname + " " + users.lastname = projects.Owner',
                    projects_managed: 'users.firstname + " " + users.lastname = projects.ProjectManager'
                  }
                },
                contacts: {
                  primaryKey: 'id',
                  fields: ['id', 'firstName', 'lastName', 'email', 'companyId'],
                  relationships: {
                    company: 'contacts.companyId = companies.id'
                  }
                }
              },
              commonQueries: {
                userProjectValue: "1. get_users → find user by name, 2. get_projects → filter by Owner/ProjectManager, 3. get_project(id) for each → sum TotalProjectValue",
                companyProjectCount: "1. get_companies → find company, 2. get_projects → filter by CompanyID, 3. count results",
                usersByJobTitle: "1. get_users → filter by jobTitle field"
              }
            }, null, 2),
          },
        ],
      };

    case 'cmap://query-examples':
      return {
        contents: [
          {
            uri,
            mimeType: 'text/markdown',
            text: `# CMAP Query Examples

## Example 1: "How much money has Stuart Harrison made on projects?"
\`\`\`javascript
// Step 1: Find Stuart Harrison
const users = await get_users();
const stuart = users.data.find(u => u.firstname === "Stuart" && u.lastname === "Harrison");

// Step 2: Find his projects  
const projects = await get_projects();
const stuartProjects = projects.data.filter(p => 
  p.Owner === "Stuart Harrison" || p.ProjectManager === "Stuart Harrison"
);

// Step 3: Get detailed financial info for each project
let totalValue = 0;
for (const project of stuartProjects) {
  const details = await get_project(project.id);
  totalValue += details[0].TotalProjectValue || 0;
}
\`\`\`

## Example 2: "Which NHS projects are over £50k?"
\`\`\`javascript
// Step 1: Find NHS companies
const companies = await get_companies();
const nhsCompanies = companies.data.filter(c => c.name.includes("NHS"));

// Step 2: Get all projects
const projects = await get_projects();
const nhsProjects = projects.data.filter(p => 
  nhsCompanies.some(c => c.id === p.CompanyID)
);

// Step 3: Check project values
const highValueProjects = [];
for (const project of nhsProjects) {
  const details = await get_project(project.id);
  if (details[0].TotalProjectValue > 50000) {
    highValueProjects.push(details[0]);
  }
}
\`\`\`
`,
          },
        ],
      };

    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_companies': {
        const result = await cmapClient.getCompanies(
          (args as any)?.page || 1,
          (args as any)?.per_page || 100
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_projects': {
        const result = await cmapClient.getProjects(
          (args as any)?.page || 1,
          (args as any)?.per_page || 100,
          (args as any)?.status || 'Project',
          (args as any)?.query || ' '
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_contacts': {
        const result = await cmapClient.getContacts(
          (args as any)?.page || 1,
          (args as any)?.per_page || 100,
          (args as any)?.company_id
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_users': {
        const result = await cmapClient.getUsers(
          (args as any)?.page || 1,
          (args as any)?.per_page || 100
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_project': {
        const projectId = (args as any)?.project_id;
        if (!projectId) {
          throw new Error('project_id is required');
        }
        const result = await cmapClient.getProject(projectId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'health_check': {
        const result = await cmapClient.healthCheck();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: result ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString(),
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
});

async function main() {
  try {
    await initializeCMapClient();
    console.error('CMAP MCP Server initialized successfully');
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    console.error('Failed to start CMAP MCP Server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});