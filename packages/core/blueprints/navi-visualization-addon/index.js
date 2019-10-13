const { dasherize } = require('ember-cli-string-utils');

module.exports = {
  description: 'Create a new navi visualization in an addon',

  locals(options) {
    const addonRawName = options.inRepoAddon ? options.inRepoAddon : options.project.name();
    const addonName = dasherize(addonRawName);

    return {
      addonName
    };
  }
};
