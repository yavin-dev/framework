/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
export default {
  definitions: {
    reports: { iconClass: 'file-text', linkRoute: 'reports.new' },
    dashboards: { iconClass: 'th-large', linkRoute: 'dashboards.new'}
  },

  /**
   * @method getTypesList
   * @returns {Array} ordered list of defined file type names
   */
  getTypes() {
    return Object.keys(this.definitions);
  }
}
