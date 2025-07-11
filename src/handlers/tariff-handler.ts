// src/handlers/tariff-handler.ts
import { OCHPClient } from '../clients/ochp-client.js';

export class TariffHandler {
  constructor(private ochpClient: OCHPClient) {}

  async updateTariffs(args: { tariffs: any[] }) {
    const result = await this.ochpClient.updateTariffs(args.tariffs);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Updated ${args.tariffs.length} tariffs.\n\nResult: ${result.result.resultCode}\nRefused: ${result.refusedTariffInfo?.length || 0}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  async getTariffUpdates(args: { lastUpdate: string }) {
    const lastUpdate = new Date(args.lastUpdate);
    const result = await this.ochpClient.getTariffUpdates(lastUpdate);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Retrieved ${result.tariffInfoArray?.length || 0} tariff updates since ${args.lastUpdate}.\n\nResult: ${result.result.resultCode}\nMore available: ${result.moreTariffsAvailable || false}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }
}