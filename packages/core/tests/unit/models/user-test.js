import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import config from 'ember-get-config';

let Store, MetadataService;

module('Unit | Model | user', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:bard-metadata');
    MetadataService.loadMetadata();
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('Retrieving records', function(assert) {
    assert.expect(1);

    return run(() => {
      return Store.findRecord('user', 'navi_user').then(() => {
        assert.ok(true, 'Found navi user');
      });
    });
  });

  test('Saving records', function(assert) {
    assert.expect(1);

    return run(() => {
      let newUser = 'new_user';
      return Store.createRecord('user', { id: newUser })
        .save()
        .then(() => {
          Store.unloadAll('user'); // flush cache/store
          return Store.findRecord('user', newUser).then(() => {
            assert.ok(true, 'Newly created user is successfully persisted');
          });
        });
    });
  });

  test('Linking Reports to Users', function(assert) {
    assert.expect(3);

    return run(() => {
      let user = Store.createRecord('user', { id: 'jon_snow' });

      Store.createRecord('report', {
        title: 'How I died! By Jon Snow',
        author: user
      });

      Store.createRecord('report', {
        title: 'You know nothing, Jon Snow',
        author: user
      });

      assert.equal(user.get('reports.length'), 2, 'Two reports are linked to the user');

      assert.deepEqual(
        user.get('reports').map(report => {
          return report.get('title');
        }),
        ['How I died! By Jon Snow', 'You know nothing, Jon Snow'],
        'The user is linked to the report, and the reports can be fetched via the relationship'
      );

      assert.equal(
        user.get('favoriteReports.length'),
        0,
        'Creating reports under a user does not impact their favorite reports'
      );
    });
  });

  test('Favoriting reports', function(assert) {
    assert.expect(3);

    let naviUser = config.navi.user;

    return run(() => {
      return Store.findRecord('user', naviUser).then(user => {
        /*
         * Fetch all reports favorited by test user or else Ember Data throws error when calling `unloadAll`
         * https://github.com/emberjs/data/issues/3084
         */
        return Store.findRecord('report', 2).then(() => {
          return Store.findRecord('report', 1).then(report => {
            // Favorite a report
            user.get('favoriteReports').pushObject(report);

            return user.save().then(() => {
              assert.equal(
                user.get('favoriteReports.lastObject.title'),
                'Hyrule News',
                'Favorite reports contains full report object'
              );

              // flush cache/Store
              Store.unloadAll();

              return Store.findRecord('user', naviUser).then(savedUser => {
                assert.deepEqual(
                  savedUser.get('favoriteReports').mapBy('id'),
                  ['2', '1'],
                  'Reports can be added to user favorites'
                );

                // Trigger async request and wait
                return savedUser.get('favoriteReports').then(() => {
                  assert.equal(
                    savedUser.get('favoriteReports.lastObject.title'),
                    'Hyrule News',
                    'Accessing favoriteReports relationship returns full report object'
                  );
                });
              });
            });
          });
        });
      });
    });
  });

  test('delivery rules relationship', function(assert) {
    assert.expect(1);

    return run(() => {
      return Store.findRecord('deliveryRule', 1).then(deliveryRule => {
        return Store.findRecord('user', 'navi_user').then(userModel => {
          return userModel.get('deliveryRules').then(rules => {
            assert.equal(
              rules.get('firstObject'),
              deliveryRule,
              'user deliveryRule property contains deliveryRule model'
            );
          });
        });
      });
    });
  });
});
