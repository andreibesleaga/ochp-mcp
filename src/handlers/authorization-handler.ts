// src/handlers/authorization-handler.ts
import { OCHPClient } from '../clients/ochp-client.js';
import { RoamingAuthorisationInfo } from '../types/ochp-types.js';

export class AuthorizationHandler {
  constructor(private ochpClient: OCHPClient) {}

  async getRoamingAuthorizationList(args: { lastUpdate?: string }) {
    const lastUpdate = args.lastUpdate ? new Date(args.lastUpdate) : undefined;
    const result = await this.ochpClient.getRoamingAuthorisationList(lastUpdate);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Retrieved ${result.roamingAuthorisationInfoArray?.length || 0} roaming authorizations.\n\nResult: ${result.result.resultCode}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  async setRoamingAuthorizationList(args: { authorizations: RoamingAuthorisationInfo[] }) {
    const result = await this.ochpClient.setRoamingAuthorisationList(args.authorizations);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Set ${args.authorizations.length} roaming authorizations.\n\nResult: ${result.result.resultCode}\nRefused: ${result.refusedRoamingAuthorisationInfo?.length || 0}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  async getSingleRoamingAuthorization(args: { contractId: string }) {
    const result = await this.ochpClient.getSingleRoamingAuthorisation(args.contractId);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Authorization for contract ${args.contractId}:\n\nResult: ${result.result.resultCode}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  async getRoamingAuthorizationListUpdates(args: { lastUpdate: string }) {
    const lastUpdate = new Date(args.lastUpdate);
    const result = await this.ochpClient.getRoamingAuthorisationListUpdates(lastUpdate);

    return {
      content: [
        {
          type: 'text' as const,
          text: `Retrieved ${result.roamingAuthorisationInfoArray?.length || 0} authorization updates since ${args.lastUpdate}.\n\nResult: ${result.result.resultCode}\nMore available: ${result.moreAuthInfoAvailable || false}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }
}