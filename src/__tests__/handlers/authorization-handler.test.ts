// src/__tests__/handlers/authorization-handler.test.ts
import { AuthorizationHandler } from '../../handlers/authorization-handler';
import { OCHPClient } from '../../clients/ochp-client';

jest.mock('../../clients/ochp-client');

describe('AuthorizationHandler', () => {
  let handler: AuthorizationHandler;
  let mockClient: jest.Mocked<OCHPClient>;

  beforeEach(() => {
    mockClient = {
      getRoamingAuthorisationList: jest.fn(),
      setRoamingAuthorisationList: jest.fn(),
      getSingleRoamingAuthorisation: jest.fn(),
      getRoamingAuthorisationListUpdates: jest.fn(),
    } as any;

    handler = new AuthorizationHandler(mockClient);
  });

  describe('getRoamingAuthorizationList', () => {
    it('should return formatted response', async () => {
      const mockResult = {
        result: { resultCode: 'ok' as const },
        roamingAuthorisationInfoArray: [{ 
          contractId: 'TEST123', 
          emtId: { instance: 'test', tokenType: 'rfid' as const }, 
          printedNumber: '123', 
          expiryDate: '2025-01-01' 
        }]
      };
      mockClient.getRoamingAuthorisationList.mockResolvedValue(mockResult);

      const result = await handler.getRoamingAuthorizationList({});

      expect(mockClient.getRoamingAuthorisationList).toHaveBeenCalledWith(undefined);
      expect(result.content[0].text).toContain('Retrieved 1 roaming authorizations');
      expect(result.content[0].text).toContain('Result: ok');
    });

    it('should handle lastUpdate parameter', async () => {
      const mockResult = { result: { resultCode: 'ok' as const }, roamingAuthorisationInfoArray: [] };
      mockClient.getRoamingAuthorisationList.mockResolvedValue(mockResult);

      await handler.getRoamingAuthorizationList({ lastUpdate: '2024-01-01T00:00:00Z' });

      expect(mockClient.getRoamingAuthorisationList).toHaveBeenCalledWith(new Date('2024-01-01T00:00:00Z'));
    });
  });

  describe('setRoamingAuthorizationList', () => {
    it('should call client with authorizations', async () => {
      const mockResult = { result: { resultCode: 'ok' as const }, refusedRoamingAuthorisationInfo: [] };
      mockClient.setRoamingAuthorisationList.mockResolvedValue(mockResult);

      const authorizations = [{ contractId: 'TEST123', emtId: { instance: 'test', tokenType: 'rfid' as const }, printedNumber: '123', expiryDate: '2025-01-01' }];
      const result = await handler.setRoamingAuthorizationList({ authorizations });

      expect(mockClient.setRoamingAuthorisationList).toHaveBeenCalledWith(authorizations);
      expect(result.content[0].text).toContain('Set 1 roaming authorizations');
    });
  });

  describe('getSingleRoamingAuthorization', () => {
    it('should call client with contractId', async () => {
      const mockResult = { result: { resultCode: 'ok' as const }, roamingAuthorisationInfo: { contractId: 'TEST123', emtId: { instance: 'test', tokenType: 'rfid' as const }, printedNumber: '123', expiryDate: '2025-01-01' } };
      mockClient.getSingleRoamingAuthorisation.mockResolvedValue(mockResult);

      const result = await handler.getSingleRoamingAuthorization({ contractId: 'TEST123' });

      expect(mockClient.getSingleRoamingAuthorisation).toHaveBeenCalledWith('TEST123');
      expect(result.content[0].text).toContain('Authorization for contract TEST123');
    });
  });

  describe('getRoamingAuthorizationListUpdates', () => {
    it('should call client with lastUpdate date', async () => {
      const mockResult = { 
        result: { resultCode: 'ok' as const }, 
        roamingAuthorisationInfoArray: [{ contractId: 'TEST123', emtId: { instance: 'test', tokenType: 'rfid' as const }, printedNumber: '123', expiryDate: '2025-01-01' }],
        moreAuthInfoAvailable: false
      };
      mockClient.getRoamingAuthorisationListUpdates.mockResolvedValue(mockResult);

      const result = await handler.getRoamingAuthorizationListUpdates({ lastUpdate: '2024-01-01T00:00:00Z' });

      expect(mockClient.getRoamingAuthorisationListUpdates).toHaveBeenCalledWith(new Date('2024-01-01T00:00:00Z'));
      expect(result.content[0].text).toContain('Retrieved 1 authorization updates');
      expect(result.content[0].text).toContain('More available: false');
    });
  });
});