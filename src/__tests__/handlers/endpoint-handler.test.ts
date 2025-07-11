// src/__tests__/handlers/endpoint-handler.test.ts
import { EndpointHandler } from '../../handlers/endpoint-handler';
import { OCHPDirectClient } from '../../clients/ochp-direct-client';

jest.mock('../../clients/ochp-direct-client');

describe('EndpointHandler', () => {
  let handler: EndpointHandler;
  let mockClient: jest.Mocked<OCHPDirectClient>;

  beforeEach(() => {
    mockClient = {
      addServiceEndpoints: jest.fn(),
      getServiceEndpoints: jest.fn(),
    } as any;

    handler = new EndpointHandler(mockClient);
  });

  it('should handle addServiceEndpoints', async () => {
    const mockResult = { result: { resultCode: 'ok' as const } };
    mockClient.addServiceEndpoints.mockResolvedValue(mockResult);

    const result = await handler.addServiceEndpoints({});
    expect(result.content[0].text).toContain('Added 0 service endpoints');
  });

  it('should handle getServiceEndpoints', async () => {
    const mockResult = {
      result: { resultCode: 'ok' as const },
      providerEndpointArray: [],
      operatorEndpointArray: []
    };
    mockClient.getServiceEndpoints.mockResolvedValue(mockResult);

    const result = await handler.getServiceEndpoints();
    expect(result.content[0].text).toContain('Provider endpoints: 0');
  });
});