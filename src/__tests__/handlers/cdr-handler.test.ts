// src/__tests__/handlers/cdr-handler.test.ts
import { CDRHandler } from '../../handlers/cdr-handler';
import { OCHPClient } from '../../clients/ochp-client';

jest.mock('../../clients/ochp-client');

describe('CDRHandler', () => {
  let handler: CDRHandler;
  let mockClient: jest.Mocked<OCHPClient>;

  beforeEach(() => {
    mockClient = {
      getCDRs: jest.fn(),
      addCDRs: jest.fn(),
      checkCDRs: jest.fn(),
    } as any;

    handler = new CDRHandler(mockClient);
  });

  it('should handle getCDRs', async () => {
    const mockResult = {
      result: { resultCode: 'ok' as const },
      cdrInfoArray: [] as any[]
    };
    mockClient.getCDRs.mockResolvedValue(mockResult);

    const result = await handler.getCDRs({});
    expect(result.content[0].text).toContain('Retrieved 0 CDRs');
  });

  it('should handle addCDRs', async () => {
    const mockResult = { 
      result: { resultCode: 'ok' as const }, 
      implausibleCdrsArray: [] 
    };
    mockClient.addCDRs.mockResolvedValue(mockResult);

    const result = await handler.addCDRs({ cdrs: [] as any[] });
    expect(result.content[0].text).toContain('Added 0 CDRs');
  });
});