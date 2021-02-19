import EmberObject from '@ember/object';

export default EmberObject.extend({
  buildData() {
    return {
      series: [
        {
          x: {
            rawValue: 0,
            displayValue: 0,
          },
          custom: 123,
          series: 234,
          grouping: 123,
        },
      ],
      names: undefined,
    };
  },

  buildTooltip() {
    return {};
  },
});
