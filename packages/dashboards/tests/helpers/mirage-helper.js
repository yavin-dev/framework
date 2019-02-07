import { startMirage } from 'dummy/initializers/ember-cli-mirage';

export function setupMock() {
  server = startMirage();
}

export function teardownMock() {
  server.shutdown();
}

export default { setupMock, teardownMock };
