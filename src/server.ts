// src/server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { OCHPClient } from './clients/ochp-client.js';
import { OCHPDirectClient } from './clients/ochp-direct-client.js';
import { AuthorizationHandler } from './handlers/authorization-handler.js';
import { ChargePointHandler } from './handlers/charge-point-handler.js';
import { CDRHandler } from './handlers/cdr-handler.js';
import { StatusHandler } from './handlers/status-handler.js';
import { OCHPConfig } from './config/ochp-config.js';
import { validateToolArguments } from './utils/validation.js';

export class OCHPMCPServer {
  private server: Server;
  private ochpClient!: OCHPClient;
  private ochpDirectClient!: OCHPDirectClient;
  private authHandler!: AuthorizationHandler;
  private chargePointHandler!: ChargePointHandler;
  private cdrHandler!: CDRHandler;
  private statusHandler!: StatusHandler;
  private config: OCHPConfig;

  constructor() {
    this.server = new Server(
      {
        name: 'ochp-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.config = new OCHPConfig();
    this.initializeClients();
    this.initializeHandlers();
    this.setupServerHandlers();
  }

  private initializeClients(): void {
    this.ochpClient = new OCHPClient(this.config);
    this.ochpDirectClient = new OCHPDirectClient(this.config);
  }

  private initializeHandlers(): void {
    this.authHandler = new AuthorizationHandler(this.ochpClient);
    this.chargePointHandler = new ChargePointHandler(this.ochpClient);
    this.cdrHandler = new CDRHandler(this.ochpClient);
    this.statusHandler = new StatusHandler(this.ochpClient, this.ochpDirectClient);
  }

  private setupServerHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Authorization Management Tools
        {
          name: 'ochp_get_roaming_authorization_list',
          description: 'Get the roaming authorization list from OCHP',
          inputSchema: {
            type: 'object',
            properties: {
              lastUpdate: {
                type: 'string',
                format: 'date-time',
                description: 'Only return authorizations updated after this timestamp',
              },
            },
          },
        },
        {
          name: 'ochp_set_roaming_authorization_list',
          description: 'Set roaming authorization data to OCHP',
          inputSchema: {
            type: 'object',
            properties: {
              authorizations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    contractId: { type: 'string' },
                    emtId: { type: 'object' },
                    printedNumber: { type: 'string' },
                    expiryDate: { type: 'string', format: 'date' },
                  },
                  required: ['contractId', 'emtId', 'printedNumber', 'expiryDate'],
                },
              },
            },
            required: ['authorizations'],
          },
        },
        {
          name: 'ochp_get_single_roaming_authorization',
          description: 'Get authorization for a specific contract ID',
          inputSchema: {
            type: 'object',
            properties: {
              contractId: {
                type: 'string',
                pattern: '^[A-Z]{2}[A-Z0-9]{3}[C][A-Z0-9]{0,8}$',
                description: 'Contract ID following ISO 15118 format',
              },
            },
            required: ['contractId'],
          },
        },

        // Charge Point Management Tools
        {
          name: 'ochp_get_charge_point_list',
          description: 'Get charge point information from OCHP',
          inputSchema: {
            type: 'object',
            properties: {
              lastUpdate: {
                type: 'string',
                format: 'date-time',
                description: 'Only return charge points updated after this timestamp',
              },
            },
          },
        },
        {
          name: 'ochp_set_charge_point_list',
          description: 'Set charge point information to OCHP',
          inputSchema: {
            type: 'object',
            properties: {
              chargePoints: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    evseId: { type: 'string' },
                    locationName: { type: 'string' },
                    address: { type: 'object' },
                    geoLocation: { type: 'object' },
                    connectors: { type: 'array' },
                    operatorName: { type: 'string' },
                  },
                  required: ['evseId', 'locationName', 'address', 'geoLocation', 'connectors', 'operatorName'],
                },
              },
            },
            required: ['chargePoints'],
          },
        },

        // Status Management Tools
        {
          name: 'ochp_get_status',
          description: 'Get live status of EVSEs',
          inputSchema: {
            type: 'object',
            properties: {
              evseIds: {
                type: 'array',
                items: {
                  type: 'string',
                  pattern: '^[A-Z]{2}[A-Z0-9]{3}[E][A-Z0-9\\*]{1,30}$',
                },
                description: 'List of EVSE IDs to get status for',
              },
              startDateTime: {
                type: 'string',
                format: 'date-time',
                description: 'Start time for status period',
              },
              endDateTime: {
                type: 'string',
                format: 'date-time',
                description: 'End time for status period',
              },
            },
          },
        },
        {
          name: 'ochp_update_status',
          description: 'Update EVSE status information',
          inputSchema: {
            type: 'object',
            properties: {
              evseStatuses: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    evseId: { type: 'string' },
                    majorStatus: {
                      type: 'string',
                      enum: ['available', 'not-available', 'unknown'],
                    },
                    minorStatus: { type: 'string' },
                    ttl: { type: 'string', format: 'date-time' },
                  },
                  required: ['evseId', 'majorStatus'],
                },
              },
            },
            required: ['evseStatuses'],
          },
        },

        // CDR Management Tools
        {
          name: 'ochp_get_cdrs',
          description: 'Get charge detail records from OCHP',
          inputSchema: {
            type: 'object',
            properties: {
              cdrStatus: {
                type: 'string',
                enum: ['approved', 'declined', 'pending'],
                description: 'Status filter for CDRs',
              },
              startDateTime: {
                type: 'string',
                format: 'date-time',
                description: 'Start time for CDR period',
              },
              endDateTime: {
                type: 'string',
                format: 'date-time',
                description: 'End time for CDR period',
              },
            },
          },
        },
        {
          name: 'ochp_add_cdrs',
          description: 'Add charge detail records to OCHP',
          inputSchema: {
            type: 'object',
            properties: {
              cdrs: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    cdrId: { type: 'string' },
                    evseId: { type: 'string' },
                    contractId: { type: 'string' },
                    startDateTime: { type: 'string', format: 'date-time' },
                    endDateTime: { type: 'string', format: 'date-time' },
                    chargingPeriods: { type: 'array' },
                  },
                  required: ['cdrId', 'evseId', 'contractId', 'startDateTime', 'endDateTime'],
                },
              },
            },
            required: ['cdrs'],
          },
        },

        // OCHP-Direct Tools
        {
          name: 'ochp_direct_select_evse',
          description: 'Select an EVSE for direct charging',
          inputSchema: {
            type: 'object',
            properties: {
              evseId: {
                type: 'string',
                pattern: '^[A-Z]{2}[A-Z0-9]{3}[E][A-Z0-9\\*]{1,30}$',
                description: 'EVSE identifier',
              },
              contractId: {
                type: 'string',
                pattern: '^[A-Z]{2}[A-Z0-9]{3}[C][A-Z0-9]{0,8}$',
                description: 'Contract identifier',
              },
              reserveUntil: {
                type: 'string',
                format: 'date-time',
                description: 'Reservation time limit',
              },
            },
            required: ['evseId', 'contractId'],
          },
        },
        {
          name: 'ochp_direct_control_evse',
          description: 'Control a selected EVSE',
          inputSchema: {
            type: 'object',
            properties: {
              directId: {
                type: 'string',
                description: 'Session ID from EVSE selection',
              },
              operation: {
                type: 'string',
                enum: ['start', 'change', 'end'],
                description: 'Operation to perform',
              },
              maxPower: {
                type: 'number',
                minimum: 0,
                description: 'Maximum power in kW',
              },
              maxCurrent: {
                type: 'number',
                minimum: 0,
                description: 'Maximum current in A',
              },
            },
            required: ['directId', 'operation'],
          },
        },
        {
          name: 'ochp_direct_release_evse',
          description: 'Release a selected EVSE',
          inputSchema: {
            type: 'object',
            properties: {
              directId: {
                type: 'string',
                description: 'Session ID to release',
              },
            },
            required: ['directId'],
          },
        },
        {
          name: 'ochp_check_cdrs',
          description: 'Check CDRs sent by this operator',
          inputSchema: {
            type: 'object',
            properties: {
              cdrStatus: {
                type: 'string',
                enum: ['approved', 'declined', 'pending'],
                description: 'Status filter for CDRs',
              },
              startDateTime: {
                type: 'string',
                format: 'date-time',
                description: 'Start time for CDR period',
              },
              endDateTime: {
                type: 'string',
                format: 'date-time',
                description: 'End time for CDR period',
              },
            },
          },
        },
        {
          name: 'ochp_get_roaming_authorization_list_updates',
          description: 'Get authorization list updates since last sync',
          inputSchema: {
            type: 'object',
            properties: {
              lastUpdate: {
                type: 'string',
                format: 'date-time',
                description: 'Last update timestamp',
              },
            },
            required: ['lastUpdate'],
          },
        },
        {
          name: 'ochp_update_charge_point_list',
          description: 'Update charge point information (delta)',
          inputSchema: {
            type: 'object',
            properties: {
              chargePoints: {
                type: 'array',
                items: { type: 'object' },
                description: 'Updated charge points',
              },
              invalidChargePoints: {
                type: 'array',
                items: { type: 'object' },
                description: 'Invalid charge points to remove',
              },
            },
          },
        },
        {
          name: 'ochp_get_charge_point_list_updates',
          description: 'Get charge point list updates since last sync',
          inputSchema: {
            type: 'object',
            properties: {
              lastUpdate: {
                type: 'string',
                format: 'date-time',
                description: 'Last update timestamp',
              },
            },
            required: ['lastUpdate'],
          },
        },
        {
          name: 'ochp_direct_report_discrepancy',
          description: 'Report an issue with an EVSE',
          inputSchema: {
            type: 'object',
            properties: {
              evseId: {
                type: 'string',
                pattern: '^[A-Z]{2}[A-Z0-9]{3}[E][A-Z0-9\\*]{1,30}$',
                description: 'EVSE identifier',
              },
              report: {
                type: 'string',
                maxLength: 2000,
                description: 'Discrepancy report text',
              },
            },
            required: ['evseId', 'report'],
          },
        },
        {
          name: 'ochp_direct_inform_provider',
          description: 'Get information about ongoing charging process',
          inputSchema: {
            type: 'object',
            properties: {
              directId: {
                type: 'string',
                description: 'Session ID for charging process',
              },
            },
            required: ['directId'],
          },
        },
      ],
    }));

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'ochp://authorization-list',
          name: 'Roaming Authorization List',
          description: 'Complete list of roaming authorizations',
          mimeType: 'application/json',
        },
        {
          uri: 'ochp://charge-points',
          name: 'Charge Point List',
          description: 'Complete list of charge points',
          mimeType: 'application/json',
        },
        {
          uri: 'ochp://evse-status',
          name: 'EVSE Status',
          description: 'Current status of all EVSEs',
          mimeType: 'application/json',
        },
        {
          uri: 'ochp://cdrs',
          name: 'Charge Detail Records',
          description: 'Historical charging data',
          mimeType: 'application/json',
        },
        {
          uri: 'ochp://wsdl-definitions',
          name: 'WSDL Definitions',
          description: 'OCHP WSDL service definitions',
          mimeType: 'application/xml',
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Validate arguments
        const validatedArgs = validateToolArguments(name, args);

        switch (name) {
          // Authorization tools
          case 'ochp_get_roaming_authorization_list':
            return await this.authHandler.getRoamingAuthorizationList(validatedArgs);
          case 'ochp_set_roaming_authorization_list':
            return await this.authHandler.setRoamingAuthorizationList(validatedArgs);
          case 'ochp_get_single_roaming_authorization':
            return await this.authHandler.getSingleRoamingAuthorization(validatedArgs);

          // Charge point tools
          case 'ochp_get_charge_point_list':
            return await this.chargePointHandler.getChargePointList(validatedArgs);
          case 'ochp_set_charge_point_list':
            return await this.chargePointHandler.setChargePointList(validatedArgs);

          // Status tools
          case 'ochp_get_status':
            return await this.statusHandler.getStatus(validatedArgs);
          case 'ochp_update_status':
            return await this.statusHandler.updateStatus(validatedArgs);

          // CDR tools
          case 'ochp_get_cdrs':
            return await this.cdrHandler.getCDRs(validatedArgs);
          case 'ochp_add_cdrs':
            return await this.cdrHandler.addCDRs(validatedArgs);

          // OCHP-Direct tools
          case 'ochp_direct_select_evse':
            return await this.statusHandler.selectEVSE(validatedArgs);
          case 'ochp_direct_control_evse':
            return await this.statusHandler.controlEVSE(validatedArgs);
          case 'ochp_direct_release_evse':
            return await this.statusHandler.releaseEVSE(validatedArgs);
          case 'ochp_direct_report_discrepancy':
            return await this.statusHandler.reportDiscrepancy(validatedArgs);
          case 'ochp_direct_inform_provider':
            return await this.statusHandler.informProvider(validatedArgs);

          // Additional OCHP tools
          case 'ochp_check_cdrs':
            return await this.cdrHandler.checkCDRs(validatedArgs);
          case 'ochp_get_roaming_authorization_list_updates':
            return await this.authHandler.getRoamingAuthorizationListUpdates(validatedArgs);
          case 'ochp_update_charge_point_list':
            return await this.chargePointHandler.updateChargePointList(validatedArgs);
          case 'ochp_get_charge_point_list_updates':
            return await this.chargePointHandler.getChargePointListUpdates(validatedArgs);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    });

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        switch (uri) {
          case 'ochp://authorization-list':
            const authList = await this.authHandler.getRoamingAuthorizationList({});
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(authList, null, 2),
                },
              ],
            };

          case 'ochp://charge-points':
            const chargePoints = await this.chargePointHandler.getChargePointList({});
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(chargePoints, null, 2),
                },
              ],
            };

          case 'ochp://evse-status':
            const status = await this.statusHandler.getStatus({});
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(status, null, 2),
                },
              ],
            };

          case 'ochp://cdrs':
            const cdrs = await this.cdrHandler.getCDRs({});
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(cdrs, null, 2),
                },
              ],
            };

          case 'ochp://wsdl-definitions':
            const wsdlDefinitions = await this.getWSDLDefinitions();
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/xml',
                  text: wsdlDefinitions,
                },
              ],
            };

          default:
            throw new Error(`Unknown resource: ${uri}`);
        }
      } catch (error) {
        throw new Error(`Error reading resource ${uri}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  private async getWSDLDefinitions(): Promise<string> {
    // Return combined WSDL definitions
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
      const wsdlDir = path.join(process.cwd(), 'wsdl');
      const ochpWsdl = await fs.readFile(path.join(wsdlDir, 'ochp.wsdl'), 'utf-8');
      const ochpDirectWsdl = await fs.readFile(path.join(wsdlDir, 'ochp-direct.wsdl'), 'utf-8');
      
      return `<!-- OCHP WSDL -->\n${ochpWsdl}\n\n<!-- OCHP-Direct WSDL -->\n${ochpDirectWsdl}`;
    } catch (error) {
      return '<!-- WSDL files not found -->';
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('OCHP MCP Server running on stdio');
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new OCHPMCPServer();
  server.run().catch(console.error);
}