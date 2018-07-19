import { moduleFor, test } from 'ember-qunit';

let Adapter;

moduleFor('adapter:dashboard-widget', 'Unit | Adapter | dashboard widget', {
  beforeEach() {
    Adapter = this.subject();
  }
});

test('it exists', function(assert) {
  assert.ok(Adapter);
});

test('urlForCreateRecord', function(assert) {
  assert.expect(1);

  let url = Adapter.urlForCreateRecord('dashboards-widget', {
    belongsTo() {
      return { id: 22 };
    }
  });

  assert.equal(
    url,
    'https://persistence.naviapp.io/dashboards/22/widgets/',
    'urlForCreateRecord gave the correct url based on the dashboard id'
  );
});

test('urlForUpdateRecord', function(assert) {
  assert.expect(1);

  let url = Adapter.urlForUpdateRecord(22, 'dashboards-widget', {
    id: 11,
    belongsTo() {
      return { id: 22 };
    }
  });

  assert.equal(
    url,
    'https://persistence.naviapp.io/dashboards/22/widgets/11',
    'urlForUpdateRecord gave the correct url based on the dashboard & widget id'
  );
});
