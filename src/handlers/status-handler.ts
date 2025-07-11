// src/handlers/status-handler.ts
import { OCHPClient } from '../clients/ochp-client.js';
import { OCHPDirectClient } from '../clients/ochp-direct-client.js';
import { EvseStatusType } from '../types/ochp-types.js';

export class StatusHandler {
  constructor(
    private ochpClient: OCHPClient,
    private ochpDirectClient: OCHPDirectClient
  ) {}

  async getStatus(args: {
    evseIds?: string[];
    startDateTime?: string;
    endDateTime?: string;
  }) {
    const startDateTime = args.startDateTime ? new Date(args.startDateTime) : undefined;
    const endDateTime = args.endDateTime ? new Date(args.endDateTime) : undefined;
    const result = await this.ochpClient.getStatus(args.evseIds, startDateTime, endDateTime);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Retrieved status for ${result.evseStatusArray?.length || 0} EVSEs.\n\nResult: ${result.result.resultCode}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  async updateStatus(args: { evseStatuses: EvseStatusType[] }) {
    const result = await this.ochpClient.updateStatus(args.evseStatuses);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Updated status for ${args.evseStatuses.length} EVSEs.\n\nResult: ${result.result.resultCode}\nRefused: ${result.refusedEvseStatusArray?.length || 0}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  async selectEVSE(args: {
    evseId: string;
    contractId: string;
    reserveUntil?: string;
  }) {
    const reserveUntil = args.reserveUntil ? new Date(args.reserveUntil) : undefined;
    const result = await this.ochpDirectClient.selectEvse(args.evseId, args.contractId, reserveUntil);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Selected EVSE ${args.evseId} for contract ${args.contractId}.\n\nResult: ${result.result.resultCode}\nDirect ID: ${result.directId}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  async controlEVSE(args: {
    directId: string;
    operation: 'start' | 'change' | 'end';
    maxPower?: number;
    maxCurrent?: number;
    onePhase?: boolean;
    maxEnergy?: number;
    minEnergy?: number;
    departure?: string;
  }) {
    const options: any = {};
    if (args.maxPower !== undefined) options.maxPower = args.maxPower;
    if (args.maxCurrent !== undefined) options.maxCurrent = args.maxCurrent;
    if (args.onePhase !== undefined) options.onePhase = args.onePhase;
    if (args.maxEnergy !== undefined) options.maxEnergy = args.maxEnergy;
    if (args.minEnergy !== undefined) options.minEnergy = args.minEnergy;
    if (args.departure) options.departure = new Date(args.departure);

    const result = await this.ochpDirectClient.controlEvse(args.directId, args.operation, options);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Controlled EVSE with operation ${args.operation}.\n\nResult: ${result.result.resultCode}\nDirect ID: ${result.directId}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  async releaseEVSE(args: { directId: string }) {
    const result = await this.ochpDirectClient.releaseEvse(args.directId);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Released EVSE session ${args.directId}.\n\nResult: ${result.result.resultCode}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  async reportDiscrepancy(args: { evseId: string; report: string }) {
    const result = await this.ochpDirectClient.reportDiscrepancy(args.evseId, args.report);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Reported discrepancy for EVSE ${args.evseId}.\n\nResult: ${result.result.resultCode}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  async informProvider(args: { directId: string }) {
    const result = await this.ochpDirectClient.informProvider(args.directId);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Retrieved charging process information for session ${args.directId}.\n\nResult: ${result.result.resultCode}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }
}