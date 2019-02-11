import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

const Directories = [
  {
    name: 'My Data',
    routeLink: 'directory.my-data',
    filters: [
      {
        name: 'Favorites',
        icon: 'star-o',
        queryParam: { filter: 'favorites' }
      }
    ]
  },
  {
    name: 'Other Data',
    routeLink: 'directory.other-data',
    filters: []
  }
];

module('Unit | Service | directories', function(hooks) {
  setupTest(hooks);

  test('returns directories', function(assert) {
    assert.expect(1);

    let service = this.owner.lookup('service:directories');
    assert.deepEqual(
      service.getDirectories(),
      Directories,
      "The service returns the directories array from the app's enums file"
    );
  });
});
