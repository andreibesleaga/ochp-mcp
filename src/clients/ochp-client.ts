// src/clients/ochp-client.ts
import * as soap from 'soap';
import { OCHPConfig } from '../config/ochp-config.js';
import { 
  RoamingAuthorisationInfo, 
  ChargePointInfo, 
  CDRInfo, 
  EvseStatusType,
  OCHPResult 
} from '../types/ochp-types.js';

export class OCHPClient {
  private client: soap.Client | null = null;
  private config: OCHPConfig;

  constructor(config: OCHPConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.client) return;

    try {
      const wsdlPath = this.config.getWSDLPath();
      this.client = await soap.createClientAsync(wsdlPath, {
        endpoint: this.config.getEndpoint(),
        wsdl_headers: this.getAuthHeaders(),
      });
    } catch (error) {
      throw new Error(`Failed to initialize OCHP client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.getApiKey()}`,
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': '',
    };
  }

  // Authorization Methods
  async getRoamingAuthorisationList(lastUpdate?: Date): Promise<{
    result: OCHPResult;
    roamingAuthorisationInfoArray: RoamingAuthorisationInfo[];
  }> {
    await this.initialize();
    
    const args = lastUpdate ? { lastUpdate: lastUpdate.toISOString() } : {};
    
    return new Promise((resolve, reject) => {
      this.client!.GetRoamingAuthorisationList(args, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  async setRoamingAuthorisationList(
    roamingAuthorisationInfoArray: RoamingAuthorisationInfo[]
  ): Promise<{
    result: OCHPResult;
    refusedRoamingAuthorisationInfo?: RoamingAuthorisationInfo[];
  }> {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this.client!.SetRoamingAuthorisationList(
        { roamingAuthorisationInfoArray },
        (err: any, result: any) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  async updateRoamingAuthorisationList(
    roamingAuthorisationInfoArray?: RoamingAuthorisationInfo[],
    invalidAuthInfoArray?: RoamingAuthorisationInfo[]
  ): Promise<{
    result: OCHPResult;
    refusedRoamingAuthorisationInfo?: RoamingAuthorisationInfo[];
  }> {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this.client!.UpdateRoamingAuthorisationList(
        { roamingAuthorisationInfoArray, invalidAuthInfoArray },
        (err: any, result: any) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  async getSingleRoamingAuthorisation(contractId: string): Promise<{
    result: OCHPResult;
    roamingAuthorisationInfo?: RoamingAuthorisationInfo;
  }> {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this.client!.GetSingleRoamingAuthorisation(
        { contractId },
        (err: any, result: any) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  // Charge Point Methods
  async getChargePointList(lastUpdate?: Date): Promise<{
    result: OCHPResult;
    chargePointInfoArray: ChargePointInfo[];
  }> {
    await this.initialize();
    
    const args = lastUpdate ? { lastUpdate: lastUpdate.toISOString() } : {};
    
    return new Promise((resolve, reject) => {
      this.client!.GetChargePointList(args, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  async setChargePointList(
    chargePointInfoArray: ChargePointInfo[]
  ): Promise<{
    result: OCHPResult;
    refusedChargePointInfo?: ChargePointInfo[];
  }> {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this.client!.SetChargePointList(
        { chargePointInfoArray },
        (err: any, result: any) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  // Status Methods
  async getStatus(
    evseIds?: string[],
    startDateTime?: Date,
    endDateTime?: Date
  ): Promise<{
    result: OCHPResult;
    evseStatusArray: EvseStatusType[];
    moreEvseStatusAvailable?: boolean;
  }> {
    await this.initialize();
    
    const args: any = {};
    if (evseIds) args.requestedEvseIds = evseIds;
    if (startDateTime) args.startDateTime = startDateTime.toISOString();
    if (endDateTime) args.endDateTime = endDateTime.toISOString();
    
    return new Promise((resolve, reject) => {
      this.client!.GetStatus(args, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  async updateStatus(evseStatusArray: EvseStatusType[]): Promise<{
    result: OCHPResult;
    refusedEvseStatusArray?: EvseStatusType[];
  }> {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this.client!.UpdateStatus(
        { evseStatusArray },
        (err: any, result: any) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  // CDR Methods
  async getCDRs(
    cdrStatus?: 'approved' | 'declined' | 'pending',
    startDateTime?: Date,
    endDateTime?: Date
  ): Promise<{
    result: OCHPResult;
    cdrInfoArray: CDRInfo[];
    moreCdrsAvailable?: boolean;
  }> {
    await this.initialize();
    
    const args: any = {};
    if (cdrStatus) args.cdrStatus = cdrStatus;
    if (startDateTime) args.startDateTime = startDateTime.toISOString();
    if (endDateTime) args.endDateTime = endDateTime.toISOString();
    
    return new Promise((resolve, reject) => {
      this.client!.GetCDRs(args, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  async addCDRs(cdrInfoArray: CDRInfo[]): Promise<{
    result: OCHPResult;
    implausibleCdrsArray?: CDRInfo[];
  }> {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this.client!.AddCDRs(
        { cdrInfoArray },
        (err: any, result: any) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  async confirmCDRs(
    approvedArray: CDRInfo[],
    declinedArray: CDRInfo[]
  ): Promise<{
    result: OCHPResult;
  }> {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this.client!.ConfirmCDRs(
        { approvedArray, declinedArray },
        (err: any, result: any) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  async checkCDRs(
    cdrStatus?: 'approved' | 'declined' | 'pending',
    startDateTime?: Date,
    endDateTime?: Date
  ): Promise<{
    result: OCHPResult;
    cdrInfoArray: CDRInfo[];
  }> {
    await this.initialize();
    
    const args: any = {};
    if (cdrStatus) args.cdrStatus = cdrStatus;
    if (startDateTime) args.startDateTime = startDateTime.toISOString();
    if (endDateTime) args.endDateTime = endDateTime.toISOString();
    
    return new Promise((resolve, reject) => {
      this.client!.CheckCDRs(args, (err: any, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  async getRoamingAuthorisationListUpdates(lastUpdate: Date): Promise<{
    result: OCHPResult;
    roamingAuthorisationInfoArray: RoamingAuthorisationInfo[];
    moreAuthInfoAvailable?: boolean;
  }> {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this.client!.GetRoamingAuthorisationListUpdates(
        { lastUpdate: lastUpdate.toISOString() },
        (err: any, result: any) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  async updateChargePointList(
    chargePointInfoArray?: ChargePointInfo[],
    invalidChargePointInfoArray?: ChargePointInfo[]
  ): Promise<{
    result: OCHPResult;
    refusedChargePointInfo?: ChargePointInfo[];
  }> {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this.client!.UpdateChargePointList(
        { chargePointInfoArray, invalidChargePointInfoArray },
        (err: any, result: any) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  async getChargePointListUpdates(lastUpdate: Date): Promise<{
    result: OCHPResult;
    chargePointInfoArray: ChargePointInfo[];
    moreChargePointInfoAvailable?: boolean;
  }> {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      this.client!.GetChargePointListUpdates(
        { lastUpdate: lastUpdate.toISOString() },
        (err: any, result: any) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }
}