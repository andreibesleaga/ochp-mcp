// src/__tests__/clients/ochp-client.test.ts
import { OCHPClient } from '../../clients/ochp-client';
import { OCHPConfig } from '../../config/ochp-config';

jest.mock('soap');
jest.mock('../../config/ochp-config');

describe('OCHPClient', () => {
  let client: OCHPClient;
  let mockConfig: jest.Mocked<OCHPConfig>;
  let mockSoapClient: any;

  beforeEach(() => {
    mockConfig = {
      getWSDLPath: jest.fn().mockReturnValue('/path/to/wsdl'),
      getEndpoint: jest.fn().mockReturnValue('https://test.com'),
      getApiKey: jest.fn().mockReturnValue('test-key'),
    } as any;

    mockSoapClient = {
      GetRoamingAuthorisationList: jest.fn(),
      SetRoamingAuthorisationList: jest.fn(),
      GetSingleRoamingAuthorisation: jest.fn(),
      GetChargePointList: jest.fn(),
      SetChargePointList: jest.fn(),
      GetStatus: jest.fn(),
      UpdateStatus: jest.fn(),
      GetCDRs: jest.fn(),
      AddCDRs: jest.fn(),
    };

    const soap = require('soap');
    soap.createClientAsync = jest.fn().mockResolvedValue(mockSoapClient);

    client = new OCHPClient(mockConfig);
  });

  describe('getRoamingAuthorisationList', () => {
    it('should call SOAP method with correct parameters', async () => {
      const mockResult = { result: { resultCode: 'ok' as const }, roamingAuthorisationInfoArray: [] };
      mockSoapClient.GetRoamingAuthorisationList.mockImplementation((args: any, callback: any) => {
        callback(null, mockResult);
      });

      const result = await client.getRoamingAuthorisationList();

      expect(mockSoapClient.GetRoamingAuthorisationList).toHaveBeenCalledWith({}, expect.any(Function));
      expect(result).toEqual(mockResult);
    });

    it('should handle date parameter', async () => {
      const mockResult = { result: { resultCode: 'ok' as const }, roamingAuthorisationInfoArray: [] };
      mockSoapClient.GetRoamingAuthorisationList.mockImplementation((args: any, callback: any) => {
        callback(null, mockResult);
      });

      const lastUpdate = new Date('2024-01-01');
      await client.getRoamingAuthorisationList(lastUpdate);

      expect(mockSoapClient.GetRoamingAuthorisationList).toHaveBeenCalledWith(
        { lastUpdate: '2024-01-01T00:00:00.000Z' },
        expect.any(Function)
      );
    });
  });

  describe('setRoamingAuthorisationList', () => {
    it('should call SOAP method with authorization array', async () => {
      const mockResult = { result: { resultCode: 'ok' as const } };
      mockSoapClient.SetRoamingAuthorisationList.mockImplementation((args: any, callback: any) => {
        callback(null, mockResult);
      });

      const authorizations = [{ contractId: 'TEST123', emtId: { instance: 'test', tokenType: 'rfid' as const }, printedNumber: '123', expiryDate: '2025-01-01' }];
      const result = await client.setRoamingAuthorisationList(authorizations);

      expect(mockSoapClient.SetRoamingAuthorisationList).toHaveBeenCalledWith(
        { roamingAuthorisationInfoArray: authorizations },
        expect.any(Function)
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('error handling', () => {
    it('should reject on SOAP error', async () => {
      const error = new Error('SOAP error');
      mockSoapClient.GetRoamingAuthorisationList.mockImplementation((args: any, callback: any) => {
        callback(error, null);
      });

      await expect(client.getRoamingAuthorisationList()).rejects.toThrow('SOAP error');
    });
  });
});