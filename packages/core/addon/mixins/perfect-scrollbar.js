/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Mixin from '@ember/object/mixin';
import computed from '@ember/object/computed';
import { get, set } from '@ember/object';
import { isPresent } from '@ember/utils';

const { PerfectScrollbar } = window;

export default Mixin.create({
  /**
   * Register resize handler.
   *
   * @override
   */
  init(...args) {
    this._super(...args);

    const resizeService = get(this, 'resizeService');

    if (isPresent(resizeService)) {
      resizeService.on('debouncedDidResize', this, '_resizePerfectScrollbar');
    }
  },

  /**
   * Initialize ps
   *
   * @override
   */
  didInsertElement(...args) {
    this._super(...args);

    set(this, 'perfectScrollbar', new PerfectScrollbar(this.element, get(this, 'perfectScrollbarOptions')));
  },

  /**
   * Tear down ps
   *
   * @override
   */
  willDestroyElement(...args) {
    this._super(...args);

    const resizeService = get(this, 'resizeService');

    if (isPresent(resizeService)) {
      resizeService.off('debouncedDidResize', this, '_resizePerfectScrollbar');
    }

    const perfectScrollbar = get(this, 'perfectScrollbar');

    perfectScrollbar && perfectScrollbar.destroy();
  },

  /**
   * @property {Object} perfectScrollbarOptions
   *
   * The options object for perfect scrollbar.
   * @see {@link https://github.com/utatti/perfect-scrollbar#options|perfect-scrollbar options}
   */
  perfectScrollbarOptions: computed(() => ({})),

  /**
   * @method _resizePerfectScrollbar
   * @private
   *
   * resize the associated perfect scrollbar instance.
   */
  _resizePerfectScrollbar() {
    get(this, 'perfectScrollbar').update();
  }
});
