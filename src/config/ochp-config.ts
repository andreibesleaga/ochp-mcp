import path from 'path';
import * as fs from 'fs';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

export class OCHPConfig {
  private readonly endpoint: string;
  private readonly directEndpoint: string;
  private readonly apiKey: string;
  private readonly username: string;
  private readonly password: string;
  private readonly operatorId: string;
  private readonly wsdlPath: string;
  private readonly directWsdlPath: string;

  constructor() {
    // Load environment variables
    this.endpoint = process.env.OCHP_ENDPOINT || 'https://echs.e-clearing.net/service/ochp/v1.4';
    this.directEndpoint = process.env.OCHP_DIRECT_ENDPOINT || 'https://echs.e-clearing.net/direct/ochp/v1.4';
    this.apiKey = process.env.OCHP_API_KEY || '';
    this.username = process.env.OCHP_USERNAME || '';
    this.password = process.env.OCHP_PASSWORD || '';
    this.operatorId = process.env.OCHP_OPERATOR_ID || '';
    this.wsdlPath = process.env.OCHP_WSDL_PATH || path.join(process.cwd(), 'wsdl', 'ochp.wsdl');
    this.directWsdlPath = process.env.OCHP_DIRECT_WSDL_PATH || path.join(process.cwd(), 'wsdl', 'ochp-direct.wsdl');

    this.validateConfig();
  }

  private validateConfig(): void {
    const requiredFields = [
      { name: 'OCHP_ENDPOINT', value: this.endpoint },
    ];

    for (const field of requiredFields) {
      if (!field.value) {
        throw new Error(`Required environment variable ${field.name} is not set`);
      }
    }
    
    if (!this.apiKey) {
      console.warn('OCHP_API_KEY not set - authentication may fail');
    }

    // Check if WSDL files exist
    if (!fs.existsSync(this.wsdlPath)) {
      console.warn(`WSDL file not found at ${this.wsdlPath}. Please ensure WSDL files are available.`);
    }
  }

  getEndpoint(): string {
    return this.endpoint;
  }

  getDirectEndpoint(): string {
    return this.directEndpoint;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  getUsername(): string {
    return this.username;
  }

  getPassword(): string {
    return this.password;
  }

  getOperatorId(): string {
    return this.operatorId;
  }

  getWSDLPath(): string {
    return this.wsdlPath;
  }

  getDirectWSDLPath(): string {
    return this.directWsdlPath;
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': '',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  getBasicAuth(): { username: string; password: string } | undefined {
    if (this.username && this.password) {
      return {
        username: this.username,
        password: this.password,
      };
    }
    return undefined;
  }
}
