import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { IncomingMessage, ServerResponse } from 'http';

export interface SseTransportConfig {
  onsessioninitialized?: (sessionId: string) => void;
  onsessionclosed?: (sessionId: string) => void;
}

export class SseMcpServerTransport extends SSEServerTransport {
  private config: SseTransportConfig;

  constructor(postEndpoint: string, res: ServerResponse, config: SseTransportConfig = {}) {
    super(postEndpoint, res);
    this.config = {
      onsessioninitialized: () => {},
      onsessionclosed: () => {},
      ...config
    };
  }

  public async initialize(): Promise<void> {
    this.config.onsessioninitialized?.(this.sessionId);
  }

  public static async createTransport(
    postEndpoint: string, 
    req: IncomingMessage, 
    res: ServerResponse, 
    config: SseTransportConfig = {}
  ): Promise<SseMcpServerTransport> {
    const transport = new SseMcpServerTransport(postEndpoint, res, config);
    
    // Set up close handler
    transport.onclose = () => {
      config.onsessionclosed?.(transport.sessionId);
    };

    // Set up error handler
    req.on('error', (error) => {
      console.error('SSE connection error:', error);
      transport.close();
    });

    await transport.initialize();
    return transport;
  }
}