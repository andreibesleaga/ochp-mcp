// src/__tests__/config/ochp-config.test.ts
import { OCHPConfig } from '../../config/ochp-config';

describe('OCHPConfig', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    // Clear environment
    delete process.env.OCHP_ENDPOINT;
    delete process.env.OCHP_API_KEY;
    delete process.env.OCHP_USERNAME;
    delete process.env.OCHP_PASSWORD;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should use default values when env vars not set', () => {
      const config = new OCHPConfig();
      
      expect(config.getEndpoint()).toBe('https://echs.e-clearing.net/service/ochp/v1.4');
      expect(config.getDirectEndpoint()).toBe('https://echs.e-clearing.net/direct/ochp/v1.4');
      expect(config.getApiKey()).toBe('');
      expect(config.getUsername()).toBe('');
      expect(config.getPassword()).toBe('');
    });

    it('should use environment variables when set', () => {
      process.env.OCHP_ENDPOINT = 'https://custom.endpoint.com';
      process.env.OCHP_API_KEY = 'custom-key';
      process.env.OCHP_USERNAME = 'custom-user';
      process.env.OCHP_PASSWORD = 'custom-pass';
      process.env.OCHP_OPERATOR_ID = 'OP123';

      const config = new OCHPConfig();

      expect(config.getEndpoint()).toBe('https://custom.endpoint.com');
      expect(config.getApiKey()).toBe('custom-key');
      expect(config.getUsername()).toBe('custom-user');
      expect(config.getPassword()).toBe('custom-pass');
      expect(config.getOperatorId()).toBe('OP123');
    });
  });

  describe('getAuthHeaders', () => {
    it('should return headers with API key when set', () => {
      process.env.OCHP_API_KEY = 'test-key';
      const config = new OCHPConfig();
      
      const headers = config.getAuthHeaders();
      
      expect(headers['Authorization']).toBe('Bearer test-key');
      expect(headers['Content-Type']).toBe('text/xml; charset=utf-8');
    });

    it('should return basic headers when no API key', () => {
      const config = new OCHPConfig();
      
      const headers = config.getAuthHeaders();
      
      expect(headers['Authorization']).toBeUndefined();
      expect(headers['Content-Type']).toBe('text/xml; charset=utf-8');
    });
  });

  describe('getBasicAuth', () => {
    it('should return auth object when username and password set', () => {
      process.env.OCHP_USERNAME = 'testuser';
      process.env.OCHP_PASSWORD = 'testpass';
      const config = new OCHPConfig();
      
      const auth = config.getBasicAuth();
      
      expect(auth).toEqual({
        username: 'testuser',
        password: 'testpass'
      });
    });

    it('should return undefined when credentials not set', () => {
      const config = new OCHPConfig();
      
      const auth = config.getBasicAuth();
      
      expect(auth).toBeUndefined();
    });
  });

  describe('WSDL paths', () => {
    it('should return default WSDL paths', () => {
      const config = new OCHPConfig();
      
      expect(config.getWSDLPath()).toContain('wsdl');
      expect(config.getWSDLPath()).toContain('ochp.wsdl');
      expect(config.getDirectWSDLPath()).toContain('ochp-direct.wsdl');
    });

    it('should use custom WSDL paths from environment', () => {
      process.env.OCHP_WSDL_PATH = '/custom/ochp.wsdl';
      process.env.OCHP_DIRECT_WSDL_PATH = '/custom/ochp-direct.wsdl';
      
      const config = new OCHPConfig();
      
      expect(config.getWSDLPath()).toBe('/custom/ochp.wsdl');
      expect(config.getDirectWSDLPath()).toBe('/custom/ochp-direct.wsdl');
    });
  });
});