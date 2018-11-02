/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  {{#perfect-scrollbar options=(hash of options)}}
 *    Content to scroll over.
 *  {{/perfect-scrollbar}}
 */

import Component from '@ember/component';
import layout from '../templates/components/perfect-scrollbar';
import PerfectScrollbarMixin from 'navi-core/mixins/perfect-scrollbar';
import { computed } from '@ember/object';

export default Component.extend(PerfectScrollbarMixin, {
  layout,

  /**
   * perfect scrollbar options hash.
   * @see {@link https://github.com/utatti/perfect-scrollbar#options|perfect-scrollbar options}
   *
   * @property {Object} options
   */
  options: undefined,

  /**
   * Used by the perfect scrollbar mixin.
   *
   * @property {Object} perfectScrollbarOptions
   * @private
   * @override
   */
  perfectScrollbarOptions: computed.reads('options').readOnly()
});
