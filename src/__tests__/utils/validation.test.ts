// src/__tests__/utils/validation.test.ts
import { validateToolArguments } from '../../utils/validation';

describe('validateToolArguments', () => {
  describe('ochp_get_roaming_authorization_list', () => {
    it('should validate empty arguments', () => {
      const result = validateToolArguments('ochp_get_roaming_authorization_list', {});
      expect(result).toEqual({});
    });

    it('should validate with lastUpdate', () => {
      const args = { lastUpdate: '2024-01-01T00:00:00Z' };
      const result = validateToolArguments('ochp_get_roaming_authorization_list', args);
      expect(result).toEqual(args);
    });

    it('should reject invalid date format', () => {
      expect(() => {
        validateToolArguments('ochp_get_roaming_authorization_list', { lastUpdate: 'invalid-date' });
      }).toThrow('Validation error');
    });
  });

  describe('ochp_direct_select_evse', () => {
    it('should validate required fields', () => {
      const args = {
        evseId: 'DEEXAE123456',
        contractId: 'DEEXAC123456'
      };
      const result = validateToolArguments('ochp_direct_select_evse', args);
      expect(result).toEqual(args);
    });

    it('should reject invalid EVSE ID format', () => {
      expect(() => {
        validateToolArguments('ochp_direct_select_evse', {
          evseId: 'INVALID',
          contractId: 'DEEXAC123456'
        });
      }).toThrow('Validation error');
    });

    it('should reject invalid contract ID format', () => {
      expect(() => {
        validateToolArguments('ochp_direct_select_evse', {
          evseId: 'DEEXAE123456',
          contractId: 'INVALID'
        });
      }).toThrow('Validation error');
    });

    it('should reject missing required fields', () => {
      expect(() => {
        validateToolArguments('ochp_direct_select_evse', { evseId: 'DEEXAE123456' });
      }).toThrow('Validation error');
    });
  });

  describe('ochp_direct_control_evse', () => {
    it('should validate required fields', () => {
      const args = {
        directId: 'session123',
        operation: 'start'
      };
      const result = validateToolArguments('ochp_direct_control_evse', args);
      expect(result).toEqual(args);
    });

    it('should validate with optional parameters', () => {
      const args = {
        directId: 'session123',
        operation: 'start',
        maxPower: 22.0,
        maxCurrent: 32.0,
        onePhase: true
      };
      const result = validateToolArguments('ochp_direct_control_evse', args);
      expect(result).toEqual(args);
    });

    it('should reject invalid operation', () => {
      expect(() => {
        validateToolArguments('ochp_direct_control_evse', {
          directId: 'session123',
          operation: 'invalid'
        });
      }).toThrow('Validation error');
    });

    it('should reject negative power values', () => {
      expect(() => {
        validateToolArguments('ochp_direct_control_evse', {
          directId: 'session123',
          operation: 'start',
          maxPower: -5.0
        });
      }).toThrow('Validation error');
    });
  });

  describe('ochp_add_cdrs', () => {
    it('should validate CDR array', () => {
      const args = {
        cdrs: [{
          cdrId: 'CDR123',
          evseId: 'DEEXAE123456',
          contractId: 'DEEXAC123456',
          startDateTime: '2024-01-01T10:00:00Z',
          endDateTime: '2024-01-01T11:00:00Z',
          chargingPeriods: [{
            startDateTime: '2024-01-01T10:00:00Z',
            endDateTime: '2024-01-01T11:00:00Z',
            billingItem: 'energy',
            billingValue: 10.5,
            itemPrice: 0.25,
            periodCost: 2.625
          }]
        }]
      };
      const result = validateToolArguments('ochp_add_cdrs', args);
      expect(result).toEqual(args);
    });

    it('should allow empty CDR array', () => {
      const result = validateToolArguments('ochp_add_cdrs', { cdrs: [] });
      expect(result.cdrs).toEqual([]);
    });
  });

  describe('unknown tool', () => {
    it('should throw error for unknown tool', () => {
      expect(() => {
        validateToolArguments('unknown_tool', {});
      }).toThrow('Unknown tool: unknown_tool');
    });
  });

  describe('edge cases', () => {
    it('should handle null arguments', () => {
      const result = validateToolArguments('ochp_get_roaming_authorization_list', null);
      expect(result).toEqual({});
    });

    it('should handle undefined arguments', () => {
      const result = validateToolArguments('ochp_get_roaming_authorization_list', undefined);
      expect(result).toEqual({});
    });
  });
});