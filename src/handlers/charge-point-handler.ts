// src/handlers/charge-point-handler.ts
import { OCHPClient } from '../clients/ochp-client.js';
import { ChargePointInfo } from '../types/ochp-types.js';

export class ChargePointHandler {
  constructor(private ochpClient: OCHPClient) {}

  async getChargePointList(args: { lastUpdate?: string }) {
    const lastUpdate = args.lastUpdate ? new Date(args.lastUpdate) : undefined;
    const result = await this.ochpClient.getChargePointList(lastUpdate);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Retrieved ${result.chargePointInfoArray?.length || 0} charge points.\n\nResult: ${result.result.resultCode}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  async setChargePointList(args: { chargePoints: ChargePointInfo[] }) {
    const result = await this.ochpClient.setChargePointList(args.chargePoints);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Set ${args.chargePoints.length} charge points.\n\nResult: ${result.result.resultCode}\nRefused: ${result.refusedChargePointInfo?.length || 0}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  async updateChargePointList(args: { 
    chargePoints?: ChargePointInfo[];
    invalidChargePoints?: ChargePointInfo[];
  }) {
    const result = await this.ochpClient.updateChargePointList(
      args.chargePoints,
      args.invalidChargePoints
    );

    return {
      content: [
        {
          type: 'text' as const,
          text: `Updated ${args.chargePoints?.length || 0} charge points, removed ${args.invalidChargePoints?.length || 0}.\n\nResult: ${result.result.resultCode}\nRefused: ${result.refusedChargePointInfo?.length || 0}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  async getChargePointListUpdates(args: { lastUpdate: string }) {
    const lastUpdate = new Date(args.lastUpdate);
    const result = await this.ochpClient.getChargePointListUpdates(lastUpdate);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Retrieved ${result.chargePointInfoArray?.length || 0} charge point updates since ${args.lastUpdate}.\n\nResult: ${result.result.resultCode}\nMore available: ${result.moreChargePointInfoAvailable || false}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }
}