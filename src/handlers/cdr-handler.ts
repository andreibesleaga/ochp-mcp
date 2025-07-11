// src/handlers/cdr-handler.ts
import { OCHPClient } from '../clients/ochp-client.js';
import { CDRInfo } from '../types/ochp-types.js';

export class CDRHandler {
  constructor(private ochpClient: OCHPClient) {}

  async getCDRs(args: { 
    cdrStatus?: 'approved' | 'declined' | 'pending';
    startDateTime?: string;
    endDateTime?: string;
  }) {
    const startDateTime = args.startDateTime ? new Date(args.startDateTime) : undefined;
    const endDateTime = args.endDateTime ? new Date(args.endDateTime) : undefined;
    const result = await this.ochpClient.getCDRs(args.cdrStatus, startDateTime, endDateTime);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Retrieved ${result.cdrInfoArray?.length || 0} CDRs.\n\nResult: ${result.result.resultCode}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  async addCDRs(args: { cdrs: CDRInfo[] }) {
    const result = await this.ochpClient.addCDRs(args.cdrs);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Added ${args.cdrs.length} CDRs.\n\nResult: ${result.result.resultCode}\nImplausible: ${result.implausibleCdrsArray?.length || 0}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  async checkCDRs(args: { 
    cdrStatus?: 'approved' | 'declined' | 'pending';
    startDateTime?: string;
    endDateTime?: string;
  }) {
    const startDateTime = args.startDateTime ? new Date(args.startDateTime) : undefined;
    const endDateTime = args.endDateTime ? new Date(args.endDateTime) : undefined;
    const result = await this.ochpClient.checkCDRs(args.cdrStatus, startDateTime, endDateTime);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Checked ${result.cdrInfoArray?.length || 0} CDRs sent by this operator.\n\nResult: ${result.result.resultCode}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }
}