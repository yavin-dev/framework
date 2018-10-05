import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('report-actions/base-action', 'Unit | Component | Report Actions | Base Action', {
  unit: true
});

test('actionDisabled', function(assert) {
  assert.expect(5);
  let component = this.subject({
    report: {
      constructor: { modelName: 'report' },
      isOwner: true,
      isNew: false
    },
    checkPermission: false
  });

  assert.equal(
    component.get('actionDisabled'),
    false,
    'actionDisabled is false when report has id, checkPermission is false and user author of the report'
  );

  component.set('report', {
    isOwner: false,
    isNew: false
  });

  assert.equal(
    component.get('actionDisabled'),
    false,
    'actionDisabled is false when report has id, checkPermission is false and user is not author of the report'
  );

  component.set('checkPermission', true);

  assert.equal(
    component.get('actionDisabled'),
    true,
    'actionDisabled is false when report has id, checkPermission is true and user is not author of the report'
  );

  component.set('report', {
    isOwner: true,
    isNew: false
  });

  assert.equal(
    component.get('actionDisabled'),
    false,
    'actionDisabled is false when report has id, checkPermission is true and user is author of the report'
  );

  component.set('report', {
    isOwner: true,
    isNew: true
  });
  assert.equal(
    component.get('actionDisabled'),
    true,
    'actionDisabled is false when report has no id, checkPermission is true and user is author of the report'
  );
});
