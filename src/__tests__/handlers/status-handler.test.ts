// src/__tests__/handlers/status-handler.test.ts
import { StatusHandler } from '../../handlers/status-handler';
import { OCHPClient } from '../../clients/ochp-client';
import { OCHPDirectClient } from '../../clients/ochp-direct-client';

jest.mock('../../clients/ochp-client');
jest.mock('../../clients/ochp-direct-client');

describe('StatusHandler', () => {
  let handler: StatusHandler;
  let mockOchpClient: jest.Mocked<OCHPClient>;
  let mockDirectClient: jest.Mocked<OCHPDirectClient>;

  beforeEach(() => {
    mockOchpClient = {
      getStatus: jest.fn(),
      updateStatus: jest.fn(),
    } as any;

    mockDirectClient = {
      selectEvse: jest.fn(),
      controlEvse: jest.fn(),
      releaseEvse: jest.fn(),
      reportDiscrepancy: jest.fn(),
      informProvider: jest.fn(),
    } as any;

    handler = new StatusHandler(mockOchpClient, mockDirectClient);
  });

  it('should handle getStatus', async () => {
    const mockResult = {
      result: { resultCode: 'ok' as const },
      evseStatusArray: [] as any[]
    };
    mockOchpClient.getStatus.mockResolvedValue(mockResult);

    const result = await handler.getStatus({});
    expect(result.content[0].text).toContain('Retrieved status for 0 EVSEs');
  });

  it('should handle selectEVSE', async () => {
    const mockResult = { result: { resultCode: 'ok' as const }, directId: 'session123' };
    mockDirectClient.selectEvse.mockResolvedValue(mockResult);

    const result = await handler.selectEVSE({
      evseId: 'DEEXAE123456',
      contractId: 'DEEXAC123456'
    });

    expect(result.content[0].text).toContain('Selected EVSE DEEXAE123456');
  });
});