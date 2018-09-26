import EmberObject from '@ember/object';

export default EmberObject.extend({
  buildData() {
    return [
      {
        x: {
          rawValue: 0,
          displayValue: 0
        },
        custom: 123,
        series: 234,
        grouping: 123
      }
    ];
  },

  buildTooltip() {
    return {};
  }
});
