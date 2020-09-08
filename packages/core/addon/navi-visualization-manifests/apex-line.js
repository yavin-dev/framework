import ManifestBase from 'navi-core/navi-visualization-manifests/base';

export default class extends ManifestBase {
  name = 'apex-line';

  niceName = 'apex-line';

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
