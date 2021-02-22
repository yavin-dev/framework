/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
export default {
  definitions: {
    reports: { iconClass: 'file-text', linkRoute: 'reports.new', color: 'green-700' },
    dashboards: { iconClass: 'dashboard-tile', linkRoute: 'dashboards.new', color: 'orange-500' },
  },

  /**
   * @method getTypesList
   * @returns {Array} ordered list of defined file type names
   */
  getTypes() {
    return Object.keys(this.definitions);
  },
};
