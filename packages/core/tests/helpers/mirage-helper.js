import { startMirage } from '../../initializers/ember-cli-mirage';

let Server;

export function setupMock() {
  Server = startMirage();
  return Server;
}

export function teardownMock() {
  Server.shutdown();
}

export default { setupMock, teardownMock };
