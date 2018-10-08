import Mixin from '@ember/object/mixin';
import { get, set } from '@ember/object';
import { isPresent } from '@ember/utils';

const { PerfectScrollbar } = window;

export default Mixin.create({
  perfectScrollbarOptions: {},

  init(...args) {
    this._super(...args);

    const resizeService = get(this, 'resizeService');

    if (isPresent(resizeService)) {
      resizeService.on('debouncedDidResize', this, '_resizePerfectScrollbar');
    }
  },

  _resizePerfectScrollbar() {
    get(this, 'perfectScrollbar').update();
  },

  didInsertElement(...args) {
    this._super(...args);

    set(this, 'perfectScrollbar', new PerfectScrollbar(this.element, get(this, 'perfectScrollbarOptions')));
  },

  willDestroyElement(...args) {
    this._super(...args);

    const resizeService = get(this, 'resizeService');

    if (isPresent(resizeService)) {
      resizeService.off('debouncedDidResize', this, '_resizePerfectScrollbar');
    }

    const perfectScrollbar = get(this, 'perfectScrollbar');

    perfectScrollbar && perfectScrollbar.destroy();
  }
});
