const { dasherize } = require('ember-cli-string-utils');
const { EOL } = require('os');

module.exports = {
  description: 'Create a new navi visualization',

  locals(options) {
    const importComponent = `import Component from '@ember/component';`;

    const importTemplate = type => {
      // if we're in an addon, build import statement
      if (options.project.isEmberCLIAddon() || (options.inRepoAddon && !options.inDummy)) {
        const path = `../../templates/components/${type}/${dasherize(options.entity.name)}`;
        return `import layout from '${path}';${EOL}`;
      } else {
        return '';
      }
    };

    let defaultExport = '';
    if (options.project.isEmberCLIAddon() || (options.inRepoAddon && !options.inDummy)) {
      defaultExport = `Component.extend({${EOL}  layout${EOL}});`;
    } else {
      defaultExport = `Component.extend({${EOL}});`;
    }

    return {
      importComponent,
      importTemplate,
      defaultExport
    };
  }
};
