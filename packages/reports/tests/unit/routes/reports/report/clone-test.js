import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | reports/report/clone', function (hooks) {
  setupTest(hooks);

  test('cloneReport', function (assert) {
    assert.expect(2);

    const store = this.owner.lookup('service:store');
    const mockAuthor = store.createRecord('user', { id: 'Gannon' });

    this.owner.register(
      'service:user',
      class MockUserService extends Service {
        getUser = () => mockAuthor;
      }
    );

    const route = this.owner.lookup('route:reports/report/clone');
    const originalReport = {
      title: 'Twilight Princess',
      author: 'Wolf Link',
      request: {},
      clone() {
        return Object.assign({}, this);
      },
    };
    const clonedReport = route.cloneReport(originalReport);

    assert.equal(
      clonedReport.title,
      `Copy of ${originalReport.title}`,
      'Cloned report title is "Copy of" + original title'
    );
    assert.equal(clonedReport.author, mockAuthor, 'Current user is the author of the cloned report');
  });
});
