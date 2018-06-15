import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

let Store, MockAuthor;

moduleFor(
  'route:dashboards/dashboard/widgets/widget/clone-to-report',
  'Unit | Route | dashboards/dashboard/widgets/widget/clone-to-report',
  {
    needs: [
      'model:user',
      'model:report',
      'model:delivery-rule',
      'model:dashboard',
      'model:dashboard-widget',
      'model:bard-request/request',
      'model:visualization',
      'model:goal-gauge',
      'validator:belongs-to',
      'validator:presence',
      'validator:has-many',
      'validator:length',
      'validator:request-metric-exist',
      'validator:chart-type',
      'validator:number',
      'validator:request-metrics',
      'validator:request-dimension-order',
      'service:bard-metadata'
    ],
    beforeEach() {
      Store = this.container.lookup('service:store');
      MockAuthor = Store.createRecord('user', { id: 'Gannon' });

      this.register(
        'service:user',
        Ember.Service.extend({
          getUser: () => MockAuthor
        })
      );
    }
  }
);

test('model', function(assert) {
  assert.expect(2);

  return Ember.run(() => {
    let widget = {
        title: 'Twilight Princess',
        author: 'Wolf Link',
        request: {
          clone: () => null
        },
        visualization: {
          type: 'goal-gauge'
        },
        toJSON() {
          return Object.assign({}, this);
        }
      },
      route = this.subject({
        modelFor() {
          return widget;
        }
      });

    let report = route.model();
    assert.equal(
      report.get('title'),
      `Copy of ${widget.title}`,
      'Created report title is "Copy of" + original title'
    );

    assert.equal(
      report.get('author.id'),
      MockAuthor.id,
      'Current user is the author of the created report'
    );
  });
});

test('_cloneToReport', function(assert) {
  assert.expect(2);

  return Ember.run(() => {
    const route = this.subject(),
      widget = {
        title: 'Twilight Princess',
        author: 'Wolf Link',
        request: {
          clone: () => null
        },
        visualization: {
          type: 'goal-gauge'
        },
        toJSON() {
          return Object.assign({}, this);
        }
      };

    let clonedReport = route._cloneToReport(widget);
    assert.equal(
      clonedReport.get('title'),
      `Copy of ${widget.title}`,
      'Created report title is "Copy of" + original title'
    );

    assert.equal(
      clonedReport.get('author.id'),
      MockAuthor.id,
      'Current user is the author of the created report'
    );
  });
});
