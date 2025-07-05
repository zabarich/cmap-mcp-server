import fetch from 'node-fetch';

export interface CMapConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
}

export interface CMapAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface CMapApiResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export class CMapClient {
  private config: CMapConfig;
  private accessToken?: string;
  private tokenExpiry?: number;
  private baseUrl: string;

  constructor(config: CMapConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.cmap-sandbox.com';
  }

  /**
   * Authenticate with CMAP OAuth2
   */
  async authenticate(): Promise<void> {
    const tokenUrl = 'https://id.cmaphq.com/connect/token';
    
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: 'api_access',
      resource: this.baseUrl
    });

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: body.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Authentication failed: ${response.status} - ${errorText}`);
      }

      const authData: CMapAuthResponse = await response.json() as CMapAuthResponse;
      this.accessToken = authData.access_token;
      this.tokenExpiry = Date.now() + (authData.expires_in * 1000);

      console.error('✅ CMAP authentication successful');
      console.error(`📍 Using tenant ID: ${this.config.tenantId}`);
    } catch (error) {
      console.error('❌ CMAP authentication failed:', error);
      throw error;
    }
  }

  /**
   * Check if token needs refresh
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry || Date.now() >= this.tokenExpiry - 60000) {
      await this.authenticate();
    }
  }

  /**
   * Make authenticated API request
   */
  private async apiRequest<T>(endpoint: string, params: Record<string, any> = {}, version: string = 'v1'): Promise<CMapApiResponse<T>> {
    await this.ensureValidToken();

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const url = `${this.baseUrl}/${version}/${endpoint}?${queryParams.toString()}`;

    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Accept': 'application/json',
      'tenant_id': this.config.tenantId
    };

    console.error(`🔍 API Request to: ${url}`);
    console.error(`🔑 Headers:`, JSON.stringify(headers, null, 2));

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      return await response.json() as CMapApiResponse<T>;
    } catch (error) {
      console.error(`❌ CMAP API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Make authenticated API request for v2 endpoints (raw response)
   */
  private async apiRequestV2<T>(endpoint: string): Promise<T> {
    await this.ensureValidToken();

    const url = `${this.baseUrl}/v2/${endpoint}`;

    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Accept': 'application/json',
      'tenant_id': this.config.tenantId
    };

    console.error(`🔍 API Request to: ${url}`);
    console.error(`🔑 Headers:`, JSON.stringify(headers, null, 2));

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error(`❌ CMAP API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get all companies with pagination
   */
  async getCompanies(page: number = 1, perPage: number = 100): Promise<CMapApiResponse<any>> {
    return this.apiRequest('companies', { page, per_page: perPage });
  }

  /**
   * Get contacts with optional company filter
   */
  async getContacts(page: number = 1, perPage: number = 100, companyId?: string): Promise<CMapApiResponse<any>> {
    const params: Record<string, any> = { page, per_page: perPage };
    if (companyId) {
      params.companyId = companyId;
    }
    return this.apiRequest('Contacts', params);
  }

  /**
   * Get all projects with pagination
   */
  async getProjects(page: number = 1, perPage: number = 100, status: string = 'Project', query: string = ' '): Promise<CMapApiResponse<any>> {
    return this.apiRequest('projects', { page, per_page: perPage, status, q: query });
  }

  /**
   * Get detailed information for a specific project
   */
  async getProject(projectId: string): Promise<any> {
    const url = `${this.baseUrl}/v1/project/${projectId}`;
    await this.ensureValidToken();

    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Accept': 'application/json',
      'tenant_id': this.config.tenantId
    };

    console.error(`🔍 API Request to: ${url}`);
    console.error(`🔑 Headers:`, JSON.stringify(headers, null, 2));

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ CMAP API request failed for project/${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get timesheets with pagination
   */
  async getTimesheets(page: number = 1, perPage: number = 100, filters: Record<string, any> = {}): Promise<CMapApiResponse<any>> {
    return this.apiRequest('timesheets', { page, per_page: perPage, ...filters });
  }

  /**
   * Get invoices with pagination
   */
  async getInvoices(page: number = 1, perPage: number = 100): Promise<CMapApiResponse<any>> {
    return this.apiRequest('invoices', { page, per_page: perPage });
  }

  /**
   * Get users with pagination
   */
  async getUsers(page: number = 1, perPage: number = 100): Promise<CMapApiResponse<any>> {
    return this.apiRequest('users', { page, per_page: perPage });
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.ensureValidToken();
      
      const response = await fetch(`${this.baseUrl}/v1/companies?per_page=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json',
          'tenant_id': this.config.tenantId
        }
      });

      return response.ok;
    } catch (error) {
      console.error('❌ CMAP health check failed:', error);
      return false;
    }
  }

  /**
   * Get budget tabs for a project (Budget v2 API)
   */
  async getBudgetTabs(projectId: string): Promise<any> {
    return this.apiRequestV2(`budget/${projectId}/tabs`);
  }

  /**
   * Get budget stages for a project (Budget v2 API)
   */
  async getBudgetStages(projectId: string): Promise<any> {
    return this.apiRequestV2(`budget/${projectId}/stages`);
  }

  /**
   * Get budget tasks for a project (Budget v2 API)
   */
  async getBudgetTasks(projectId: string): Promise<any> {
    return this.apiRequestV2(`budget/${projectId}/tasks`);
  }
}