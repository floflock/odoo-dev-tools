import { log } from '../utils/odoo-detector';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: 'call';
  params: Record<string, unknown>;
  id: number;
}

interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: {
      name?: string;
      debug?: string;
      message?: string;
    };
  };
}

interface Report {
  id: number;
  name: string;
  report_name: string;
  model: string;
  report_type: string;
}

let requestId = 0;

function getBaseUrl(): string {
  return `${window.location.protocol}//${window.location.host}`;
}

async function jsonRpc<T = unknown>(
  endpoint: string,
  params: Record<string, unknown>
): Promise<T> {
  const url = `${getBaseUrl()}${endpoint}`;
  const request: JsonRpcRequest = {
    jsonrpc: '2.0',
    method: 'call',
    params,
    id: ++requestId,
  };

  log('JSON-RPC Request:', endpoint, JSON.stringify(params, null, 2));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data: JsonRpcResponse<T> = await response.json();

  if (data.error) {
    const errorMsg = data.error.data?.message || data.error.message;
    log('JSON-RPC Error:', errorMsg);
    throw new Error(errorMsg);
  }

  log('JSON-RPC Response:', data.result);
  return data.result as T;
}

export const odooClient = {
  /**
   * Search and read records from a model
   */
  async searchRead<T = Record<string, unknown>>(
    model: string,
    domain: unknown[] = [],
    fields: string[] = [],
    options: { limit?: number; offset?: number; order?: string } = {}
  ): Promise<T[]> {
    return jsonRpc<T[]>('/web/dataset/call_kw', {
      model,
      method: 'search_read',
      args: [domain],
      kwargs: {
        fields,
        limit: options.limit,
        offset: options.offset,
        order: options.order,
      },
    });
  },

  /**
   * Get all available reports for a specific model
   */
  async getReportsForModel(model: string): Promise<Report[]> {
    log('Fetching reports for model:', model);

    try {
      // Search by model field (the data model the report renders)
      const reports = await this.searchRead<Report>(
        'ir.actions.report',
        [['model', '=', model]],
        ['id', 'name', 'report_name', 'model', 'report_type']
      );
      log('Reports found for', model + ':', reports.length, reports);
      return reports;
    } catch (error) {
      log('Error fetching reports:', error);
      return [];
    }
  },

  /**
   * Generate report URL for HTML view
   */
  getReportHtmlUrl(reportName: string, recordId: number): string {
    const baseUrl = getBaseUrl();
    return `${baseUrl}/report/html/${reportName}/${recordId}`;
  },

  /**
   * Generate report URL for PDF view
   */
  getReportPdfUrl(reportName: string, recordId: number): string {
    const baseUrl = getBaseUrl();
    return `${baseUrl}/report/pdf/${reportName}/${recordId}`;
  },

  /**
   * Get current user info
   */
  async getUserInfo(): Promise<{
    uid: number;
    name: string;
    username: string;
    company_id: number;
    company_name: string;
  } | null> {
    try {
      const result = await jsonRpc<{
        uid: number;
        name: string;
        username: string;
        company_id: [number, string];
      }>('/web/session/get_session_info', {});

      return {
        uid: result.uid,
        name: result.name,
        username: result.username,
        company_id: result.company_id[0],
        company_name: result.company_id[1],
      };
    } catch (error) {
      log('Error fetching user info:', error);
      return null;
    }
  },

  /**
   * Set user language
   */
  async setUserLanguage(userId: number, lang: string): Promise<boolean> {
    log('Setting user language:', { userId, lang });
    try {
      await jsonRpc('/web/dataset/call_kw', {
        model: 'res.users',
        method: 'write',
        args: [[userId], { lang }],
        kwargs: {},
      });
      log('Language updated successfully');
      return true;
    } catch (error) {
      log('Error setting user language:', error);
      return false;
    }
  },
};
