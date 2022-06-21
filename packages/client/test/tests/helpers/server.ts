import type { SetupWorkerApi } from 'msw';
import type { SetupServerApi } from 'msw/node';

const IS_NODE = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

async function getServer() {
  if (IS_NODE) {
    const server = (await import('msw/lib/node/index.js')).setupServer();
    server.listen();
    return server;
  } else {
    const server = (await import('msw')).setupWorker();
    await server.start();
    return server;
  }
}

export interface WithServer {
  server: SetupWorkerApi | SetupServerApi;
}

/**
 * Sets up the Service Worker (for web) and Server (for node) for tests
 * @param hooks - qunit test hooks
 */
export default function setupServer(hooks: NestedHooks) {
  hooks.beforeEach(async function (this: WithServer) {
    this.server = await getServer();
  });

  hooks.afterEach(function (this: WithServer) {
    if ('close' in this.server) {
      this.server.close();
    } else if ('stop' in this.server) {
      this.server.stop();
    }
  });
}
