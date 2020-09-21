/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-values/null-input
 *       filter=filter
 *       onUpdateFilter=(action 'update')
 *   }}
 */
import Component from '@ember/component';
import { isEqual } from 'lodash-es';

export default Component.extend({
  tagName: '',

  /**
   * @method didInsertElement
   * @override
   */
  didInsertElement() {
    this._super(...arguments);

    const {
      isCollapsed,
      onUpdateFilter,
      filter: { values }
    } = this;

    /*
     * Since this operator doesn't require values, set an empty array
     */
    if (!isCollapsed && (isEqual(values, ['""']) || !!values.length)) {
      onUpdateFilter({ values: [] });
    }
  }
});
