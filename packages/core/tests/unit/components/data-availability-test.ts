import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { overallAvailability } from 'navi-core/components/data-availability';
import { AvailabilityResult, Status } from 'navi-data/services/data-availability';
import moment from 'moment';

function makeAvailability(status: Status, index: number) {
  let result: AvailabilityResult;
  if (status === Status.UNAVAILABLE) {
    result = { status, error: new Error() };
  } else {
    result = { status, date: moment.utc() };
  }
  return { dataSource: `d${index}`, displayName: `D${index}`, result };
}

const STATUSES = [Status.OK, Status.DELAYED, Status.LATE, Status.UNAVAILABLE];

type Test = { statuses: Status[]; overallAvailability: Status; message: string };
function assertAvailability(assert: Assert, test: Test) {
  const availabilities = test.statuses.map((status, index) => makeAvailability(status, index));
  assert.strictEqual(overallAvailability(availabilities), test.overallAvailability, test.message);
}

module('Unit | Component | data-availability', function (hooks) {
  setupTest(hooks);

  test('overallAvailability ', function (assert) {
    assert.expect(21);

    assertAvailability(assert, {
      statuses: [],
      overallAvailability: Status.UNAVAILABLE,
      message: 'overall is unavailable if no statuses exist',
    });

    for (const status of STATUSES) {
      assertAvailability(assert, {
        statuses: [status],
        overallAvailability: status,
        message: `overall status is ${status} if only status is ${status}`,
      });
    }

    for (const status1 of STATUSES) {
      for (const status2 of STATUSES) {
        if (status1 === status2) {
          assertAvailability(assert, {
            statuses: [status1, status2],
            overallAvailability: status1,
            message: `overall status is ${status1} if only status is ${status1}`,
          });
        } else {
          assertAvailability(assert, {
            statuses: [status1, status2],
            overallAvailability: Status.DELAYED,
            message: 'overall status is delayed if there are conflicting statuses',
          });
        }
      }
    }
  });
});
