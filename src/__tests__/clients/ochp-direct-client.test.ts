// src/__tests__/clients/ochp-direct-client.test.ts
import { OCHPDirectClient } from '../../clients/ochp-direct-client';
import { OCHPConfig } from '../../config/ochp-config';

jest.mock('soap');
jest.mock('../../config/ochp-config');

describe('OCHPDirectClient', () => {
  let client: OCHPDirectClient;
  let mockConfig: jest.Mocked<OCHPConfig>;
  let mockSoapClient: any;

  beforeEach(() => {
    mockConfig = {
      getDirectWSDLPath: jest.fn().mockReturnValue('/path/to/direct-wsdl'),
      getDirectEndpoint: jest.fn().mockReturnValue('https://test.com/direct'),
      getApiKey: jest.fn().mockReturnValue('test-key'),
    } as any;

    mockSoapClient = {
      SelectEvse: jest.fn(),
      ControlEvse: jest.fn(),
      ReleaseEvse: jest.fn(),
      GetEvseStatus: jest.fn(),
      ReportDiscrepancy: jest.fn(),
      InformProviderCPO: jest.fn(),
    };

    const soap = require('soap');
    soap.createClientAsync = jest.fn().mockResolvedValue(mockSoapClient);

    client = new OCHPDirectClient(mockConfig);
  });

  describe('selectEvse', () => {
    it('should call SOAP method with required parameters', async () => {
      const mockResult = { result: { resultCode: 'ok' as const }, directId: 'session123' };
      mockSoapClient.SelectEvse.mockImplementation((args: any, callback: any) => {
        callback(null, mockResult);
      });

      const result = await client.selectEvse('DEEXAE123456', 'DEEXAC123456');

      expect(mockSoapClient.SelectEvse).toHaveBeenCalledWith(
        { evseId: 'DEEXAE123456', contractId: 'DEEXAC123456' },
        expect.any(Function)
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle optional reserveUntil parameter', async () => {
      const mockResult = { result: { resultCode: 'ok' as const }, directId: 'session123' };
      mockSoapClient.SelectEvse.mockImplementation((args: any, callback: any) => {
        callback(null, mockResult);
      });

      const reserveUntil = new Date('2024-01-01T12:00:00Z');
      await client.selectEvse('DEEXAE123456', 'DEEXAC123456', reserveUntil);

      expect(mockSoapClient.SelectEvse).toHaveBeenCalledWith(
        { 
          evseId: 'DEEXAE123456', 
          contractId: 'DEEXAC123456',
          reserveUntil: '2024-01-01T12:00:00.000Z'
        },
        expect.any(Function)
      );
    });
  });

  describe('controlEvse', () => {
    it('should call SOAP method with operation', async () => {
      const mockResult = { result: { resultCode: 'ok' as const }, directId: 'session123' };
      mockSoapClient.ControlEvse.mockImplementation((args: any, callback: any) => {
        callback(null, mockResult);
      });

      const result = await client.controlEvse('session123', 'start');

      expect(mockSoapClient.ControlEvse).toHaveBeenCalledWith(
        { directId: 'session123', operation: 'start' },
        expect.any(Function)
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle control options', async () => {
      const mockResult = { result: { resultCode: 'ok' as const } };
      mockSoapClient.ControlEvse.mockImplementation((args: any, callback: any) => {
        callback(null, mockResult);
      });

      await client.controlEvse('session123', 'start', { 
        maxPower: 22.0, 
        maxCurrent: 32.0,
        departure: new Date('2024-01-01T18:00:00Z')
      });

      expect(mockSoapClient.ControlEvse).toHaveBeenCalledWith(
        { 
          directId: 'session123', 
          operation: 'start',
          maxPower: 22.0,
          maxCurrent: 32.0,
          departure: '2024-01-01T18:00:00.000Z'
        },
        expect.any(Function)
      );
    });
  });

  describe('releaseEvse', () => {
    it('should call SOAP method with directId', async () => {
      const mockResult = { result: { resultCode: 'ok' as const } };
      mockSoapClient.ReleaseEvse.mockImplementation((args: any, callback: any) => {
        callback(null, mockResult);
      });

      const result = await client.releaseEvse('session123');

      expect(mockSoapClient.ReleaseEvse).toHaveBeenCalledWith(
        { directId: 'session123' },
        expect.any(Function)
      );
      expect(result).toEqual(mockResult);
    });
  });
});