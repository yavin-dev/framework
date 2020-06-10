/* eslint-env browser, node */

//const debug = require('debug')('BackstopJS');

module.exports = async (page, scenario) => {
  //debug('SCENARIO > ' + scenario.label);

  //const debug = require('debug')('BackstopJS');

  await require('./overrideCSS')(page, scenario);
  await require('./clickAndHoverHelper')(page, scenario);

  // add more ready handlers here...
};
