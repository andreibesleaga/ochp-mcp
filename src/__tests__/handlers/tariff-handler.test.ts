// src/__tests__/handlers/tariff-handler.test.ts
import { TariffHandler } from '../../handlers/tariff-handler';
import { OCHPClient } from '../../clients/ochp-client';

jest.mock('../../clients/ochp-client');

describe('TariffHandler', () => {
  let handler: TariffHandler;
  let mockClient: jest.Mocked<OCHPClient>;

  beforeEach(() => {
    mockClient = {
      updateTariffs: jest.fn(),
      getTariffUpdates: jest.fn(),
    } as any;

    handler = new TariffHandler(mockClient);
  });

  it('should handle updateTariffs', async () => {
    const mockResult = { result: { resultCode: 'ok' as const }, refusedTariffInfo: [] };
    mockClient.updateTariffs.mockResolvedValue(mockResult);

    const result = await handler.updateTariffs({ tariffs: [] });
    expect(result.content[0].text).toContain('Updated 0 tariffs');
  });

  it('should handle getTariffUpdates', async () => {
    const mockResult = {
      result: { resultCode: 'ok' as const },
      tariffInfoArray: [],
      moreTariffsAvailable: false
    };
    mockClient.getTariffUpdates.mockResolvedValue(mockResult);

    const result = await handler.getTariffUpdates({ lastUpdate: '2024-01-01T00:00:00Z' });
    expect(result.content[0].text).toContain('Retrieved 0 tariff updates');
  });
});