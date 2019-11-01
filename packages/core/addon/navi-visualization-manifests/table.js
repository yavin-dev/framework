/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Visualization Manifest File for the Table Visualization
 * This file registers the visualization with navi
 *
 */
import ManifestBase from './base';

export default ManifestBase.extend({
  /**
   * @property name
   */
  name: 'table',

  /**
   * @property niceName
   */
  niceName: 'Data Table',

  /**
   * @property icon
   */
  icon: 'table',

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
});
