import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

const widgetModel = {
  author: 'navi',
  request: {
    clone() {
      return {};
    }
  },
  toJSON() {
    return {
      title: 'test',
      visualization: {
        type: 'line-chart'
      }
    };
  }
};

module('Unit | Helper | reportify', function(hooks) {
  setupTest(hooks);

  test('reportify returns report', function(assert) {
    assert.expect(2);

    const reportify = this.owner.factoryFor('helper:reportify').create();
    const report = reportify.compute([widgetModel]);
    const reportObject = report.toJSON();

    assert.deepEqual(reportObject.title, 'test', 'Report should have correct title');
    assert.deepEqual(reportObject.visualization.type, 'line-chart', 'Report should have correct visualization type');
  });
});
