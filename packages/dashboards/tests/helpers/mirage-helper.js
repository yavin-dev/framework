import mirage from '../../initializers/ember-cli-mirage';

export function setupMock(){
  mirage.initialize();
}

export function teardownMock(){
  server.shutdown();
}

export default { setupMock, teardownMock };
