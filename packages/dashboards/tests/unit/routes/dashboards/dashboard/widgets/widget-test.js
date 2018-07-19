import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';

const { A: array } = Ember;

moduleFor(
  'route:dashboards/dashboard/widgets/widget',
  'Unit | Route | dashboards/dashboard/widgets/widget',
  {
    needs: [
      'service:navi-notifications',
      'service:navi-visualizations',
      'service:report-action-dispatcher',
      'service:user'
    ]
  }
);

test('model hook', function(assert) {
  assert.expect(3);

  let route = this.subject({
    store: {
      peekAll() {
        return array([{ id: undefined, tempId: '123-456' }]);
      }
    },
    modelFor() {
      return array([{ id: 1 }]);
    }
  });

  /* == Persisted id == */
  let model = route.model({ widgetId: 1 });
  assert.equal(model.id, 1, 'Route model looks up widget based on id');

  /* == Temp id == */
  model = route.model({ widgetId: '123-456' });
  assert.equal(
    model.tempId,
    '123-456',
    'Route can find widgets based on temp id'
  );

  /* == Error widget not found == */
  try {
    route.model({ widgetId: 10 });
  } catch (error) {
    assert.equal(
      error.message,
      'Widget 10 could not be found',
      'An error notification is shown when widget does not exist in dashboard'
    );
  }
});

test('_findByTempId', function(assert) {
  assert.expect(2);

  let route = this.subject({
    store: {
      peekAll() {
        return [{ tempId: 1 }, { tempId: 2 }, { tempId: 3 }];
      }
    }
  });

  assert.equal(
    route._findByTempId(2).tempId,
    2,
    'Widgets can be found by temp id'
  );

  assert.equal(
    route._findByTempId(50),
    undefined,
    'Undefined is returned when no widget has the given temp id'
  );
});

test('saveWidget action', function(assert) {
  assert.expect(3);

  let savePromise = Ember.RSVP.reject(),
    mockWidget = {
      save: () => savePromise
    },
    mockNotificationService = {},
    route = this.subject({
      naviNotifications: mockNotificationService,
      replaceWith: Ember.K // Functionality covered in acceptance test
    });

  return Ember.run(() => {
    /* == Error save == */
    mockNotificationService.add = ({ type }) => {
      assert.equal(
        type,
        'danger',
        'Danger notification is shown when save was unsuccesful'
      );
    };

    route.send('saveWidget', mockWidget);

    return savePromise.catch(() => {
      /* == Succesful save == */
      mockNotificationService.add = ({ type }) => {
        assert.equal(
          type,
          'success',
          'Success notification is shown when save was succesful'
        );
      };
      Ember.getOwner(route).register(
        'route:dashboards/dashboard',
        Ember.Route.extend({
          refresh() {
            assert.ok(
              true,
              'Parent dashboard route is asked to refresh with latest widget changes'
            );
          }
        })
      );
      savePromise = Ember.RSVP.resolve();

      route.send('saveWidget', mockWidget);
      return savePromise;
    });
  });
});
