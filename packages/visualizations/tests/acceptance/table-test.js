import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | table');

test('visiting /table', function(assert) {
  assert.expect(2);

  visit('/table');

  andThen(function() {
    assert.deepEqual(find('.table-header-cell__title').toArray().map(el => $(el).text().trim()),[
      'Date',
      'Operating System',
      'Unique Identifiers',
      'Total Page Views',
      'Total Page Views WoW'
    ], 'The headers for the table are as specified');
  });

  andThen(() => {
    return reorder(
      'mouse',
      '.table-header-cell',
      '.os',
      '.dateTime',
      '.uniqueIdentifier',
      '.totalPageViews',
      '.totalPageViewsWoW'
    );
  });

  andThen(() => {
    assert.deepEqual(find('.table-header-cell__title').toArray().map(el => $(el).text().trim()),[
      'Operating System',
      'Date',
      'Unique Identifiers',
      'Total Page Views',
      'Total Page Views WoW'
    ], 'The headers are reordered as specified by the reorder');
  });
});
