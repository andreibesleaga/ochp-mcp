// src/clients/ochp-direct-client.ts
import * as soap from 'soap';
import { OCHPConfig } from '../config/ochp-config.js';
import { DirectResult, EvseStatusType } from '../types/ochp-types.js';

export class OCHPDirectClient {
  private client: soap.Client | null = null;
  private config: OCHPConfig;

  constructor(config: OCHPConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.client) return;

    try {
      const wsdlPath = this.config.getDirectWSDLPath();
      this.client = await soap.createClientAsync(wsdlPath, {
        endpoint: this.config.getDirectEndpoint(),
        wsdl_headers: this.getAuthHeaders(),
      });
    } catch (error) {
      throw new Error(`Failed to initialize OCHP-Direct client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.getApiKey()}`,
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': '',
    };
  }

  async getEvseStatus(requestedEvseIds: string[]): Promise<{
    result: DirectResult;
    evseStatuses?: EvseStatusType[];
  }> {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this.client!.GetEvseStatus(
        { requestedEvseIds },
        (err: any, result: any) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  async selectEvse(
    evseId: string,
    contractId: string,
    reserveUntil?: Date
  ): Promise<{
    result: DirectResult;
    directId?: string;
    ttl?: Date;
  }> {
    await this.initialize();
    
    const args: any = { evseId, contractId };
    if (reserveUntil) args.reserveUntil = reserveUntil.toISOString();
    
    return new Promise((resolve, reject) => {
      this.client!.SelectEvse(args, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  async controlEvse(
    directId: string,
    operation: 'start' | 'change' | 'end',
    options?: {
      maxPower?: number;
      maxCurrent?: number;
      onePhase?: boolean;
      maxEnergy?: number;
      minEnergy?: number;
      departure?: Date;
    }
  ): Promise<{
    result: DirectResult;
    directId?: string;
    ttl?: Date;
  }> {
    await this.initialize();
    
    const args: any = { directId, operation };
    if (options) {
      Object.assign(args, options);
      if (options.departure) {
        args.departure = options.departure.toISOString();
      }
    }
    
    return new Promise((resolve, reject) => {
      this.client!.ControlEvse(args, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  async releaseEvse(directId: string): Promise<{
    result: DirectResult;
    directId?: string;
    ttl?: Date;
  }> {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this.client!.ReleaseEvse(
        { directId },
        (err: any, result: any) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  async reportDiscrepancy(
    evseId: string,
    report: string
  ): Promise<{
    result: DirectResult;
  }> {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this.client!.ReportDiscrepancy(
        { evseId, report },
        (err: any, result: any) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  async informProvider(directId: string): Promise<{
    result: DirectResult;
    message?: string;
    evseId?: string;
    contractId?: string;
    ttl?: Date;
    maxPower?: number;
    maxCurrent?: number;
    chargedEnergy?: number;
    currentCost?: number;
  }> {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this.client!.InformProviderCPO(
        { directId },
        (err: any, result: any) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  async addServiceEndpoints(
    providerEndpoints?: any[],
    operatorEndpoints?: any[]
  ): Promise<{
    result: DirectResult;
  }> {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this.client!.AddServiceEndpoints(
        { providerEndpointArray: providerEndpoints, operatorEndpointArray: operatorEndpoints },
        (err: any, result: any) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  async getServiceEndpoints(): Promise<{
    result: DirectResult;
    providerEndpointArray?: any[];
    operatorEndpointArray?: any[];
  }> {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this.client!.GetServiceEndpoints(
        {},
        (err: any, result: any) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }
}