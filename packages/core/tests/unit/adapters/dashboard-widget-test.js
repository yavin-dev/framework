import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

let Adapter;

module('Unit | Adapter | dashboard widget', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    Adapter = this.owner.lookup('adapter:dashboard-widget');
  });

  test('it exists', function (assert) {
    assert.ok(Adapter);
  });

  test('urlForCreateRecord', function (assert) {
    assert.expect(1);

    let url = Adapter.urlForCreateRecord('dashboards-widget', {
      belongsTo() {
        return { id: 22 };
      },
    });

    assert.equal(
      url,
      'https://persistence.naviapp.io/dashboards/22/widgets/',
      'urlForCreateRecord gave the correct url based on the dashboard id'
    );
  });

  test('urlForUpdateRecord', function (assert) {
    assert.expect(1);

    let url = Adapter.urlForUpdateRecord(22, 'dashboards-widget', {
      id: 11,
      belongsTo() {
        return { id: 22 };
      },
    });

    assert.equal(
      url,
      'https://persistence.naviapp.io/dashboards/22/widgets/11',
      'urlForUpdateRecord gave the correct url based on the dashboard & widget id'
    );
  });
});
