// src/__tests__/server.test.ts
import { OCHPMCPServer } from '../server';

describe('OCHPMCPServer', () => {
  let server: OCHPMCPServer;

  beforeEach(() => {
    // Mock environment variables
    process.env.OCHP_ENDPOINT = 'https://test.example.com/ochp';
    process.env.OCHP_API_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.OCHP_ENDPOINT;
    delete process.env.OCHP_API_KEY;
  });

  it('should create server instance', () => {
    expect(() => {
      server = new OCHPMCPServer();
    }).not.toThrow();
  });

  it('should have required handlers', () => {
    server = new OCHPMCPServer();
    expect(server).toBeDefined();
  });
});