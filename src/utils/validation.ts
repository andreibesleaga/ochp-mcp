// src/utils/validation.ts
import { z } from 'zod';

const evseIdSchema = z.string().regex(/^[A-Z]{2}[A-Z0-9]{3}[E][A-Z0-9\*]{1,30}$/);
const contractIdSchema = z.string().regex(/^[A-Z]{2}[A-Z0-9]{3}[C][A-Z0-9]{0,8}$/);

const toolSchemas = {
  ochp_get_roaming_authorization_list: z.object({
    lastUpdate: z.string().datetime().optional(),
  }),
  ochp_set_roaming_authorization_list: z.object({
    authorizations: z.array(z.object({
      contractId: contractIdSchema,
      emtId: z.object({
        instance: z.string(),
        representation: z.enum(['plain', 'sha-160', 'sha-256']).optional(),
        tokenType: z.enum(['rfid', 'remote']),
        tokenSubType: z.string().optional(),
      }),
      printedNumber: z.string(),
      expiryDate: z.string(),
    })),
  }),
  ochp_get_single_roaming_authorization: z.object({
    contractId: contractIdSchema,
  }),
  ochp_get_charge_point_list: z.object({
    lastUpdate: z.string().datetime().optional(),
  }),
  ochp_set_charge_point_list: z.object({
    chargePoints: z.array(z.object({
      evseId: evseIdSchema,
      locationName: z.string(),
      address: z.object({
        houseNumber: z.string(),
        address: z.string(),
        city: z.string(),
        zipCode: z.string(),
        country: z.string(),
      }),
      geoLocation: z.object({
        lat: z.number(),
        lon: z.number(),
      }),
      connectors: z.array(z.object({
        connectorId: z.number(),
        connectorStandard: z.string(),
        connectorFormat: z.enum(['Socket', 'Cable']),
      })),
      operatorName: z.string(),
    })),
  }),
  ochp_get_status: z.object({
    evseIds: z.array(evseIdSchema).optional(),
    startDateTime: z.string().datetime().optional(),
    endDateTime: z.string().datetime().optional(),
  }),
  ochp_update_status: z.object({
    evseStatuses: z.array(z.object({
      evseId: evseIdSchema,
      majorStatus: z.enum(['available', 'not-available', 'unknown']),
      minorStatus: z.string().optional(),
      ttl: z.string().datetime().optional(),
    })),
  }),
  ochp_get_cdrs: z.object({
    cdrStatus: z.enum(['approved', 'declined', 'pending']).optional(),
    startDateTime: z.string().datetime().optional(),
    endDateTime: z.string().datetime().optional(),
  }),
  ochp_add_cdrs: z.object({
    cdrs: z.array(z.object({
      cdrId: z.string(),
      evseId: evseIdSchema,
      contractId: contractIdSchema,
      startDateTime: z.string().datetime(),
      endDateTime: z.string().datetime(),
      chargingPeriods: z.array(z.object({
        startDateTime: z.string().datetime(),
        endDateTime: z.string().datetime(),
        billingItem: z.enum(['power', 'energy', 'parkingtime', 'usagetime', 'reservation']),
        billingValue: z.number(),
        itemPrice: z.number(),
        periodCost: z.number(),
      })),
    })),
  }),
  ochp_direct_select_evse: z.object({
    evseId: evseIdSchema,
    contractId: contractIdSchema,
    reserveUntil: z.string().datetime().optional(),
  }),
  ochp_direct_control_evse: z.object({
    directId: z.string(),
    operation: z.enum(['start', 'change', 'end']),
    maxPower: z.number().min(0).optional(),
    maxCurrent: z.number().min(0).optional(),
    onePhase: z.boolean().optional(),
    maxEnergy: z.number().min(0).optional(),
    minEnergy: z.number().min(0).optional(),
    departure: z.string().datetime().optional(),
  }),
  ochp_direct_release_evse: z.object({
    directId: z.string(),
  }),
  ochp_check_cdrs: z.object({
    cdrStatus: z.enum(['approved', 'declined', 'pending']).optional(),
    startDateTime: z.string().datetime().optional(),
    endDateTime: z.string().datetime().optional(),
  }),
  ochp_get_roaming_authorization_list_updates: z.object({
    lastUpdate: z.string().datetime(),
  }),
  ochp_update_charge_point_list: z.object({
    chargePoints: z.array(z.object({
      evseId: evseIdSchema,
      locationName: z.string(),
      address: z.object({
        houseNumber: z.string(),
        address: z.string(),
        city: z.string(),
        zipCode: z.string(),
        country: z.string(),
      }),
      geoLocation: z.object({
        lat: z.number(),
        lon: z.number(),
      }),
      connectors: z.array(z.object({
        connectorId: z.number(),
        connectorStandard: z.string(),
        connectorFormat: z.enum(['Socket', 'Cable']),
      })),
      operatorName: z.string(),
    })).optional(),
    invalidChargePoints: z.array(z.object({
      evseId: evseIdSchema,
    })).optional(),
  }),
  ochp_get_charge_point_list_updates: z.object({
    lastUpdate: z.string().datetime(),
  }),
  ochp_direct_report_discrepancy: z.object({
    evseId: evseIdSchema,
    report: z.string().max(2000),
  }),
  ochp_direct_inform_provider: z.object({
    directId: z.string(),
  }),
  ochp_update_tariffs: z.object({
    tariffs: z.array(z.object({})),
  }),
  ochp_get_tariff_updates: z.object({
    lastUpdate: z.string().datetime(),
  }),
  ochp_direct_add_service_endpoints: z.object({
    providerEndpoints: z.array(z.object({})).optional(),
    operatorEndpoints: z.array(z.object({})).optional(),
  }),
  ochp_direct_get_service_endpoints: z.object({}),
};

export function validateToolArguments(toolName: string, args: any): any {
  const schema = toolSchemas[toolName as keyof typeof toolSchemas];
  if (!schema) {
    throw new Error(`Unknown tool: ${toolName}`);
  }
  
  try {
    return schema.parse(args || {});
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error for ${toolName}: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    throw error;
  }
}