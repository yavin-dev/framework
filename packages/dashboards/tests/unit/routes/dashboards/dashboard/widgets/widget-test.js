import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import { reject, resolve } from 'rsvp';
import { A as array } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | dashboards/dashboard/widgets/widget', function (hooks) {
  setupTest(hooks);

  test('model hook', function (assert) {
    assert.expect(3);

    let route = this.owner.factoryFor('route:dashboards/dashboard/widgets/widget').create({
      store: {
        peekAll() {
          return array([{ id: undefined, tempId: '123-456' }]);
        },
      },
      modelFor() {
        return array([{ id: 1 }]);
      },
    });

    /* == Persisted id == */
    let model = route.model({ widget_id: 1 });
    assert.equal(model.id, 1, 'Route model looks up widget based on id');

    /* == Temp id == */
    model = route.model({ widget_id: '123-456' });
    assert.equal(model.tempId, '123-456', 'Route can find widgets based on temp id');

    /* == Error widget not found == */
    try {
      route.model({ widget_id: 10 });
    } catch (error) {
      assert.equal(
        error.message,
        'Widget 10 could not be found',
        'An error notification is shown when widget does not exist in dashboard'
      );
    }
  });

  test('_findByTempId', function (assert) {
    assert.expect(2);

    let route = this.owner.factoryFor('route:dashboards/dashboard/widgets/widget').create({
      store: {
        peekAll() {
          return [{ tempId: 1 }, { tempId: 2 }, { tempId: 3 }];
        },
      },
    });

    assert.equal(route._findByTempId(2).tempId, 2, 'Widgets can be found by temp id');

    assert.equal(route._findByTempId(50), undefined, 'Undefined is returned when no widget has the given temp id');
  });

  test('saveWidget action', function (assert) {
    assert.expect(3);

    let savePromise = reject(),
      mockWidget = {
        save: () => savePromise,
      },
      mockNotificationService = {},
      route = this.owner.factoryFor('route:dashboards/dashboard/widgets/widget').create({
        naviNotifications: mockNotificationService,
        replaceWith: () => undefined, // Functionality covered in acceptance test
      });

    return run(() => {
      /* == Error save == */
      mockNotificationService.add = ({ style }) => {
        assert.equal(style, 'danger', 'Danger notification is shown when save was unsuccessful');
      };

      route.send('saveWidget', mockWidget);

      return savePromise.catch(() => {
        /* == Successful save == */
        mockNotificationService.add = ({ style }) => {
          assert.equal(style, 'success', 'Success notification is shown when save was successful');
        };
        getOwner(route).register(
          'route:dashboards/dashboard',
          Route.extend({
            refresh() {
              assert.ok(true, 'Parent dashboard route is asked to refresh with latest widget changes');
            },
          })
        );
        savePromise = resolve();

        route.send('saveWidget', mockWidget);
        return savePromise;
      });
    });
  });
});
