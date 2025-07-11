# OCHP MCP Server

A Model Context Protocol (MCP) server implementation for OCHP (Open Clearing House Protocol) services, enabling AI assistants to interact with EV charging infrastructure.

## Features

- **Complete OCHP 1.4 Protocol Support**: Authorization, charge points, CDRs, status management
- **OCHP-Direct Integration**: Real-time EVSE control and monitoring
- **MCP Protocol Compliance**: Works with Claude Desktop and other MCP clients
- **Type-Safe Implementation**: TypeScript with comprehensive validation
- **SOAP/WSDL Integration**: Direct connection to OCHP services

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your OCHP credentials
   ```

3. **Build and run:**
   ```bash
   npm run build
   npm start
   ```

## Configuration

Required environment variables in `.env`:

```bash
OCHP_ENDPOINT=https://your-ochp-service.com/service/ochp/v1.4
OCHP_DIRECT_ENDPOINT=https://your-ochp-service.com/direct/ochp/v1.4
OCHP_API_KEY=your-api-key
OCHP_USERNAME=your-username
OCHP_PASSWORD=your-password
OCHP_OPERATOR_ID=your-operator-id
```

## Claude Desktop Integration

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "ochp": {
      "command": "node",
      "args": ["path/to/ochp-mcp-server/dist/server.js"],
      "env": {
        "OCHP_ENDPOINT": "https://your-endpoint.com",
        "OCHP_API_KEY": "your-key"
      }
    }
  }
}
```

## Available Tools

### Authorization Management

- `ochp_get_roaming_authorization_list` - Retrieve authorization data
- `ochp_set_roaming_authorization_list` - Update authorization data
- `ochp_get_single_roaming_authorization` - Get specific authorization

### Charge Point Management

- `ochp_get_charge_point_list` - Retrieve charge point information
- `ochp_set_charge_point_list` - Update charge point data

### Status Management

- `ochp_get_status` - Get EVSE status information
- `ochp_update_status` - Update EVSE status

### CDR Management

- `ochp_get_cdrs` - Retrieve charge detail records
- `ochp_add_cdrs` - Submit new CDRs

### OCHP-Direct Control

- `ochp_direct_select_evse` - Reserve EVSE for charging
- `ochp_direct_control_evse` - Start/stop/modify charging session
- `ochp_direct_release_evse` - Release EVSE reservation

## Available Resources

- `ochp://authorization-list` - Complete authorization data
- `ochp://charge-points` - Charge point information
- `ochp://evse-status` - Real-time EVSE status
- `ochp://cdrs` - Historical charging data
- `ochp://wsdl-definitions` - WSDL service definitions

## Usage Examples

### Get Authorization List

```json
{
  "name": "ochp_get_roaming_authorization_list",
  "arguments": {
    "lastUpdate": "2024-01-01T00:00:00Z"
  }
}
```

### Set Charge Point

```json
{
  "name": "ochp_set_charge_point_list",
  "arguments": {
    "chargePoints": [
      {
        "evseId": "DEEXAE123456",
        "locationName": "Example Station",
        "address": {
          "houseNumber": "123",
          "address": "Example Street",
          "city": "Example City",
          "zipCode": "12345",
          "country": "DE"
        },
        "geoLocation": {
          "lat": 52.520008,
          "lon": 13.404954
        },
        "connectors": [
          {
            "connectorId": 1,
            "connectorStandard": "IEC_62196_T2",
            "connectorFormat": "Socket"
          }
        ],
        "operatorName": "Example Operator"
      }
    ]
  }
}
```

### Direct EVSE Control

```json
// Select EVSE
{
  "name": "ochp_direct_select_evse",
  "arguments": {
    "evseId": "DEEXAE123456",
    "contractId": "DEEXAC123456"
  }
}

// Start charging
{
  "name": "ochp_direct_control_evse",
  "arguments": {
    "directId": "session-id-from-select",
    "operation": "start",
    "maxPower": 22.0
  }
}
```

## Development

### Project Structure

```
src/
├── server.ts              # Main MCP server
├── clients/               # OCHP SOAP clients
├── handlers/              # Request handlers
├── types/                 # TypeScript definitions
├── utils/                 # Utilities and validation
└── config/                # Configuration management
```

### Commands

```bash
npm run dev      # Development mode
npm run build    # Build TypeScript
npm test         # Run tests
npm run lint     # Lint code
npm run format   # Format code
```

## Protocol Support

- **OCHP 1.4**: Complete specification implementation
- **OCHP-Direct 0.2**: Real-time EVSE control
- **Authentication**: Bearer token and basic auth
- **Validation**: Comprehensive input validation
- **Error Handling**: Proper OCHP error responses

## Requirements

- Node.js 18+
- OCHP service access
- WSDL files (included)
- Valid API credentials

## License

Apache 2.0 License
