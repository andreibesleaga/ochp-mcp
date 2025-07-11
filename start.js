#!/usr/bin/env node

// Simple startup script for the OCHP MCP Server
import { OCHPMCPServer } from './dist/server.js';

const server = new OCHPMCPServer();
server.run().catch(console.error);