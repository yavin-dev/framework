import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | reports/report', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const controller = this.owner.lookup('controller:reports/report');
    assert.ok(controller);
  });

  test('reportState', function(assert) {
    const controller = this.owner.lookup('controller:reports/report');

    const getProps = () =>
      controller.getProperties('isEditingReport', 'isRunningReport', 'didReportComplete', 'didReportFail');

    controller.set('reportState', 'editing');
    assert.deepEqual(
      getProps(),
      {
        isEditingReport: true,
        isRunningReport: false,
        didReportComplete: false,
        didReportFail: false
      },
      'Setting reportState to `editing` updates computed properties correctly'
    );

    controller.set('reportState', 'running');
    assert.deepEqual(
      getProps(),
      {
        isEditingReport: false,
        isRunningReport: true,
        didReportComplete: false,
        didReportFail: false
      },
      'Setting reportState to `running` updates computed properties correctly'
    );

    controller.set('reportState', 'completed');
    assert.deepEqual(
      getProps(),
      {
        isEditingReport: false,
        isRunningReport: false,
        didReportComplete: true,
        didReportFail: false
      },
      'Setting reportState to `completed` updates computed properties correctly'
    );

    controller.set('reportState', 'failed');
    assert.deepEqual(
      getProps(),
      {
        isEditingReport: false,
        isRunningReport: false,
        didReportComplete: false,
        didReportFail: true
      },
      'Setting reportState to `completed` updates computed properties correctly'
    );
  });

  test('Invalid reportState', function(assert) {
    const controller = this.owner.lookup('controller:reports/report');

    assert.throws(
      () => controller.set('reportState', 'badState'),
      /Invalid reportState: `badState`. Must be one of the following: running,editing,completed,failed/,
      'Setting a bad report state throws an error'
    );
  });
});
