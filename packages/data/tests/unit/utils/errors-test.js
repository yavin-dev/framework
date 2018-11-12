import ErrorUtils from 'navi-data/utils/errors';
import { module, test } from 'qunit';

module('Unit - Utils - Error Utils', function() {
  test('handleErrors', function(assert) {
    assert.expect(3);

    const fetchResponseError = {
      status: 507,
      _bodyText: 'Error Message'
    };
    assert.throws(
      () => ErrorUtils.handleErrors(fetchResponseError),
      /Error Message/,
      'handleErrors parses the error message when the status is `not ok`'
    );

    const fetchResponse = {
      status: 200,
      ok: true,
      _bodyText: 'Response'
    };
    assert.equal(
      ErrorUtils.handleErrors(fetchResponse),
      fetchResponse,
      'handleErrors returns the response when status is `200`'
    );

    const fetchResponseJSONError = {
      status: 507,
      _bodyText: '{ reason: `JSON Error Message` }'
    };
    assert.throws(
      () => ErrorUtils.handleErrors(fetchResponseJSONError),
      /JSON Error Message/,
      'handleErrors parses the json error message when the status is `not ok`'
    );
  });
});
