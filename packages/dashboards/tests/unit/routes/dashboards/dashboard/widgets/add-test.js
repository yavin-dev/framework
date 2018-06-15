import { moduleFor, test } from 'ember-qunit';

let Route;

moduleFor(
  'route:dashboards/dashboard/widgets/add',
  'Unit | Route | dashboards/dashboard/widgets/add',
  {
    needs: [
      'controller:dashboards/dashboard/widgets/add',
      'model:dashboard',
      'model:dashboard-widget',
      'service:navi-notifications'
    ],
    beforeEach() {
      Route = this.subject();
    }
  }
);

test('it exists', function(assert) {
  assert.ok(Route);
});

test('_findNextAvailableRow', function(assert) {
  assert.expect(2);

  let layout = [];

  assert.equal(
    Route._findNextAvailableRow(layout),
    0,
    '_findNextAvailableRow returns 0 when there are no widgets in the dashboard'
  );

  layout = [
    { row: 0, column: 0, height: 2, widgetId: 1 },
    { row: 2, column: 0, height: 5, widgetId: 3 },
    { row: 0, column: 2, height: 2, widgetId: 2 }
  ];
  assert.equal(
    Route._findNextAvailableRow(layout),
    7,
    '_findNextAvailableRow finds the next available row'
  );
});

test('_addToLayout', function(assert) {
  assert.expect(2);

  let layout = [];

  assert.deepEqual(
    Route._addToLayout(layout, 42),
    [{ row: 0, column: 0, height: 4, width: 5, widgetId: 42 }],
    '_addToLayout adds a widget to an empty dashboard'
  );

  layout = [
    { row: 0, column: 0, height: 2, widgetId: 1 },
    { row: 2, column: 0, height: 5, widgetId: 3 },
    { row: 0, column: 2, height: 2, widgetId: 2 }
  ];
  assert.deepEqual(
    Route._addToLayout(layout, 42),
    [
      { row: 0, column: 0, height: 2, widgetId: 1 },
      { row: 2, column: 0, height: 5, widgetId: 3 },
      { row: 0, column: 2, height: 2, widgetId: 2 },
      { row: 7, column: 0, height: 4, width: 5, widgetId: 42 }
    ],
    '_addToLayout adds a widget to the end of the dashboard'
  );
});
