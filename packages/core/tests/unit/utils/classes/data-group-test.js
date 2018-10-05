/**
 *
 */
import { module, test } from 'qunit';
import DataGroup from 'navi-core/utils/classes/data-group';

const DATA = [
  {
    dateTime: '2012-01',
    adClicks: 12
  },
  {
    dateTime: '2012-02',
    adClicks: 13
  },
  {
    dateTime: '2012-02',
    adClicks: 50
  },
  {
    dateTime: '2012-03',
    adClicks: 14
  },
  {
    dateTime: '2012-04',
    adClicks: 15
  }
];

module('Unit | Utils | DataGroup Class');

test('Construction', function(assert) {
  assert.expect(2);

  assert.throws(
    function() {
      new DataGroup();
    },
    /Data rows must be defined/,
    'error is thrown while constructing with undefined rows'
  );

  assert.throws(
    function() {
      new DataGroup(DATA);
    },
    /Grouping function must be defined/,
    'error is thrown while constructing with undefined groupingFn'
  );

  // Test for no error on valid construction
  new DataGroup(DATA, row => {
    return row.dateTime;
  });
});

test('getDataForKey', function(assert) {
  assert.expect(1);

  let dataGroup = new DataGroup(DATA, row => {
    return row.dateTime;
  });

  assert.deepEqual(
    dataGroup.getDataForKey('2012-02'),
    DATA.slice(1, 3),
    'Data is grouped by key returned from grouping function'
  );
});

test('getKeys', function(assert) {
  assert.expect(1);

  let dataGroup = new DataGroup(DATA, row => {
    return row.dateTime;
  });

  assert.deepEqual(
    dataGroup.getKeys(),
    ['2012-01', '2012-02', '2012-03', '2012-04'],
    'All keys found in data are returned'
  );
});
