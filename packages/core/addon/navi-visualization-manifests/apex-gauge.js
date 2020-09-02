import ManifestBase from 'navi-core/navi-visualization-manifests/base';

export default class ApexGaugeVisualizationManifest extends ManifestBase {
  name = 'apex-gauge';

  niceName = 'apex-gauge';

  icon = 'tachometer';

  /**
   * Decides whether visualization type is valid given request
   *
   * @method typeIsValid
   * @param {Object} request - request object
   * @return {Boolean} - visualization type is valid
   */
  typeIsValid(request) {
    return this.hasSingleMetric(request) && this.hasSingleTimeBucket(request) && this.hasNoGroupBy(request);
  }
}
