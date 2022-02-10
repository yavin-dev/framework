import Perspective from '@yavin-ui/perspective';
export function initialize(appInstance) {
  const service = appInstance.lookup('service:visualization');
  service.registerVisualization(new Perspective());
}

export default {
  initialize,
};
