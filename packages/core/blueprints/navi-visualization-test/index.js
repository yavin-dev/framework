const { classify, dasherize } = require('ember-cli-string-utils');

function invocationFor(options) {
  const parts = options.entity.name.split('/');
  return parts.map(p => classify(p)).join('::');
}

module.exports = {
  description: 'Create a new navi visualization test',

  locals(options) {
    const dasherizedModuleName = dasherize(options.entity.name);
    const componentPathName = [options.path, dasherizedModuleName].filter(Boolean).join('/');
    const friendlyTestDescription = [ 'Integration', 'Component', dasherizedModuleName ].join(' | ');

    const selfCloseComponent = descriptor => `<${descriptor} />`;

    const componentName = invocationFor(options);

    return  {
      componentName,
      componentPathName,
      friendlyTestDescription,
      selfCloseComponent
    };
  }
};
