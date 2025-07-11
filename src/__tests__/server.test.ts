// src/__tests__/server.test.ts
import { validateToolArguments } from '../utils/validation';

describe('OCHPMCPServer Integration', () => {
  beforeEach(() => {
    process.env.OCHP_ENDPOINT = 'https://test.example.com/ochp';
    process.env.OCHP_DIRECT_ENDPOINT = 'https://test.example.com/direct';
  });

  afterEach(() => {
    delete process.env.OCHP_ENDPOINT;
    delete process.env.OCHP_DIRECT_ENDPOINT;
  });

  describe('Tool validation integration', () => {
    it('should validate tools with optional parameters', () => {
      const toolsWithOptionalParams = [
        'ochp_get_roaming_authorization_list',
        'ochp_get_charge_point_list',
        'ochp_get_status',
        'ochp_get_cdrs',
        'ochp_check_cdrs'
      ];

      toolsWithOptionalParams.forEach(tool => {
        expect(() => {
          validateToolArguments(tool, {});
        }).not.toThrow();
      });
    });

    it('should validate tool with valid arguments', () => {
      const result = validateToolArguments('ochp_direct_select_evse', {
        evseId: 'DEEXAE123456',
        contractId: 'DEEXAC123456'
      });
      
      expect(result.evseId).toBe('DEEXAE123456');
      expect(result.contractId).toBe('DEEXAC123456');
    });

    it('should reject invalid tool arguments', () => {
      expect(() => {
        validateToolArguments('ochp_direct_select_evse', {
          evseId: 'INVALID',
          contractId: 'DEEXAC123456'
        });
      }).toThrow('Validation error');
    });
  });

  describe('Environment configuration', () => {
    it('should have required environment variables', () => {
      expect(process.env.OCHP_ENDPOINT).toBeDefined();
      expect(process.env.OCHP_DIRECT_ENDPOINT).toBeDefined();
    });
  });
});