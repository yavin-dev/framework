import Service from '@ember/service';
import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { moduleFor, test } from 'ember-qunit';

moduleFor('route:reports/report/clone', 'Unit | Route | reports/report/clone', {
  needs: ['model:user', 'model:report', 'model:delivery-rule', 'model:dashboard', 'service:navi-notifications']
});

test('_cloneReport', function(assert) {
  assert.expect(3);

  return run(() => {
    const store = getOwner(this).lookup('service:store'),
      mockAuthor = store.createRecord('user', { id: 'Gannon' });

    this.register(
      'service:user',
      Service.extend({
        getUser: () => mockAuthor
      })
    );

    const route = this.subject(),
      originalReport = {
        title: 'Twilight Princess',
        author: 'Wolf Link',
        request: {
          responseFormat: 'json'
        },
        clone() {
          return Object.assign({}, this);
        }
      },
      clonedReport = route._cloneReport(originalReport);

    assert.equal(
      clonedReport.title,
      `Copy of ${originalReport.title}`,
      'Cloned report title is "Copy of" + original title'
    );

    assert.equal(
      clonedReport.request.responseFormat,
      'csv',
      'Response format is defaulted to csv, regardless of original report'
    );

    assert.equal(clonedReport.author, mockAuthor, 'Current user is the author of the cloned report');
  });
});
