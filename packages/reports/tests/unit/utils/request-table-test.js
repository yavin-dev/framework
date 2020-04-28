import { module, test } from 'qunit';
import { getDefaultTimeGrain } from 'navi-reports/utils/request-table';
import config from 'ember-get-config';

module('Unit | Utils | request table', function() {
  test('getDefaultTimeGrain', function(assert) {
    const { defaultTimeGrain } = config.navi;

    const timeGrains = [
      {
        id: 'hour',
        name: 'Hour'
      },
      {
        id: 'day',
        name: 'Day'
      },
      {
        id: 'week',
        name: 'Week'
      }
    ];

    assert.deepEqual(
      getDefaultTimeGrain(timeGrains),
      {
        id: 'day',
        name: 'Day'
      },
      'Returns the default time grain from config'
    );

    config.navi.defaultTimeGrain = 'week';
    assert.deepEqual(
      getDefaultTimeGrain(timeGrains),
      {
        id: 'week',
        name: 'Week'
      },
      'Returns the default time grain after config change'
    );

    config.navi.defaultTimeGrain = 'foo';
    assert.deepEqual(
      getDefaultTimeGrain(timeGrains),
      {
        id: 'hour',
        name: 'Hour'
      },
      'Returns the first time grain when default is not found'
    );

    config.navi.defaultTimeGrain = defaultTimeGrain;
  });
});
