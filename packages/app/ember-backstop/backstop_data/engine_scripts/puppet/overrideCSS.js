/* eslint-env browser, node */

module.exports = function(page) {
  // inject arbitrary css to override styles
  page.evaluate(() => {
    // This is an internal rendering shim. This does not touch any Ember project code.
    // Specifically: Ember-Backstop works by:
    // 1) Isolating Ember test DOM generated in the Testem env,
    // 2) Injecting it into a rendering harness,
    // 3) Serializing it, and
    // 4) Passing it to BackstopJS for rendering & diffing in the Backstop Env.
    // This file is used by BackstopJS during step 4 to normalize and reconstitute styles once they have left the testem enviornment.
    const BACKSTOP_TEST_CSS_OVERRIDE = `#ember-testing {width: 100% !important; height: 100% !important; -webkit-transform: scale(1) !important; transform: scale(1) !important;}`;
    let style = document.createElement('style');
    style.type = 'text/css';
    let styleNode = document.createTextNode(BACKSTOP_TEST_CSS_OVERRIDE);
    style.appendChild(styleNode);
    document.head.appendChild(style);
  });
};
