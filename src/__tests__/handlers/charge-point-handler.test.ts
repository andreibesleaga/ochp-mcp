// src/__tests__/handlers/charge-point-handler.test.ts
import { ChargePointHandler } from '../../handlers/charge-point-handler';
import { OCHPClient } from '../../clients/ochp-client';

jest.mock('../../clients/ochp-client');

describe('ChargePointHandler', () => {
  let handler: ChargePointHandler;
  let mockClient: jest.Mocked<OCHPClient>;

  beforeEach(() => {
    mockClient = {
      getChargePointList: jest.fn(),
      setChargePointList: jest.fn(),
      updateChargePointList: jest.fn(),
      getChargePointListUpdates: jest.fn(),
    } as any;

    handler = new ChargePointHandler(mockClient);
  });

  it('should handle getChargePointList', async () => {
    const mockResult = {
      result: { resultCode: 'ok' as const },
      chargePointInfoArray: [] as any[]
    };
    mockClient.getChargePointList.mockResolvedValue(mockResult);

    const result = await handler.getChargePointList({});
    expect(result.content[0].text).toContain('Retrieved 0 charge points');
  });

  it('should handle setChargePointList', async () => {
    const mockResult = { result: { resultCode: 'ok' as const }, refusedChargePointInfo: [] };
    mockClient.setChargePointList.mockResolvedValue(mockResult);

    const result = await handler.setChargePointList({ chargePoints: [] as any[] });
    expect(result.content[0].text).toContain('Set 0 charge points');
  });
});