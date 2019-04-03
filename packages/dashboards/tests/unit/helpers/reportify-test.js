import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';

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

    let reportify = this.owner.lookup('helper:reportify');

    return settled().then(() => {
      return run(() => {
        let report = reportify.compute([widgetModel]),
          reportObject = report.toJSON();

        assert.deepEqual(reportObject.title, 'test', 'Report should have correct title');
        assert.deepEqual(
          reportObject.visualization.type,
          'line-chart',
          'Report should have correct visualization type'
        );
      });
    });
  });
});
