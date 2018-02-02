import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | route helpers');

test('route helpers', function(assert) {
  assert.expect(6);

  visit('/helpers');
  andThen(function() {
    assert.equal(find('#parent').text(),
      'helpers',
      'parent-route helper return parent route name');

    assert.equal(find('#current').text(),
      'helpers.index',
      'current-route helper return current route name');

    assert.equal(find('#sibling').text(),
      'helpers.sibling',
      'sibling-route helper return a generated name based on parent and given sibling name');
  });

  click('#link-to-child');
  andThen(function() {
    assert.equal(find('#parent').text(),
      'helpers.child1',
      'parent-route updates with route transition');

    assert.equal(find('#current').text(),
      'helpers.child1.child2',
      'current-route updates with route transition');

    assert.equal(find('#sibling').text(),
      'helpers.child1.sibling',
      'sibling-route updates with route transition');
  });
});
