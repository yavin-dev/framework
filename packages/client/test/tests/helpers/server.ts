import type { SetupWorkerApi } from 'msw';
import type { SetupServerApi } from 'msw/node';

const IS_NODE = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

let server: SetupServerApi | SetupWorkerApi | null = null;
async function getServer() {
  if (server) {
    return server;
  }
  if (IS_NODE) {
    server = (await import('msw/node')).setupServer();
    server.listen({ onUnhandledRequest: 'error' });
    return server;
  } else {
    server = (await import('msw')).setupWorker();
    await server.start({ onUnhandledRequest: 'error' });
    return server;
  }
}

export interface WithServer {
  server: SetupWorkerApi | SetupServerApi;
}

/**
 * Shutdown server after all tests have finished because calling
 * `setupServer` will polyfill request interception multiple times
 * and then fail to intercept requests.
 */
QUnit.done(() => {
  if (!server) {
    return;
  }
  if ('close' in server) {
    server.close();
  } else if ('stop' in server) {
    server.stop();
  }
  server = null;
});

/**
 * Sets up the Service Worker (for web) and Server (for node) for tests
 * @param hooks - qunit test hooks
 */
export default function setupServer(hooks: NestedHooks) {
  hooks.before(async function (this: WithServer) {
    this.server = await getServer();
  });

  hooks.beforeEach(function (this: WithServer) {
    this.server.resetHandlers();
  });
}
