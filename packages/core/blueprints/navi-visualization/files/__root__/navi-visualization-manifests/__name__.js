import NaviVisualizationBaseManifest from 'navi-core/navi-visualization-manifests/base';

export default class <%= classifiedModuleName %> extends NaviVisualizationBaseManifest {
  name = '<%= dasherizedModuleName %>';

  niceName = '<%= dasherizedModuleName %>';

  icon = 'info';

  /**
   * Decides whether visualization type is valid given request
   *
   * @method typeIsValid
   * @param {Object} request - request object
   * @return {Boolean} - visualization type is valid
   */
  typeIsValid(/*request*/) {
    return true;
  }
}
