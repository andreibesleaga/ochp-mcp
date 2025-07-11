// src/handlers/endpoint-handler.ts
import { OCHPDirectClient } from '../clients/ochp-direct-client.js';

export class EndpointHandler {
  constructor(private ochpDirectClient: OCHPDirectClient) {}

  async addServiceEndpoints(args: { 
    providerEndpoints?: any[];
    operatorEndpoints?: any[];
  }) {
    const result = await this.ochpDirectClient.addServiceEndpoints(
      args.providerEndpoints,
      args.operatorEndpoints
    );

    return {
      content: [
        {
          type: 'text' as const,
          text: `Added ${(args.providerEndpoints?.length || 0) + (args.operatorEndpoints?.length || 0)} service endpoints.\n\nResult: ${result.result.resultCode}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  async getServiceEndpoints() {
    const result = await this.ochpDirectClient.getServiceEndpoints();

    return {
      content: [
        {
          type: 'text' as const,
          text: `Retrieved service endpoints.\n\nResult: ${result.result.resultCode}\nProvider endpoints: ${result.providerEndpointArray?.length || 0}\nOperator endpoints: ${result.operatorEndpointArray?.length || 0}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }
}