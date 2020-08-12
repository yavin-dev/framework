/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ManifestBase from 'navi-core/navi-visualization-manifests/base';

export default class extends ManifestBase {
  name = 'apex-pie';

  niceName = 'apex-pie';

  icon = 'info';

  /**
   * Decides whether visualization type is valid given request
   *
   * @method typeIsValid
   * @param {Object} request - request object
   * @return {Boolean} - visualization type is valid
   */
  typeIsValid(request) {
    return this.hasSingleTimeBucket(request) && this.hasSingleMetric(request) && this.hasGroupBy(request);
  }
}
