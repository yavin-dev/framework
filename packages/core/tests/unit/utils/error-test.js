import { getApiErrMsg, _getErrorText } from 'navi-core/utils/error';
import { module, test } from 'qunit';

module('Unit | Utils | Error', function() {
  test('data timeout message - unit test', function(assert) {
    assert.expect(1);

    let status = null,
      detail = 'The adapter operation timed out';

    assert.equal(
      getApiErrMsg({ status, detail }),
      'Data Timeout',
      'The correct message is returned when the ajax request times out'
    );
  });

  test('bard message', function(assert) {
    assert.expect(1);

    let status = 400,
      detail = { description: 'Metric(s) "[foo]" do not exist.' };

    assert.equal(
      getApiErrMsg({ status, detail }),
      `${detail.description}`,
      'The error message displayed is based on the bard response'
    );
  });

  test('regular expression matched error', function(assert) {
    assert.expect(1);
    assert.equal(
      getApiErrMsg({ detail: 'Rate limit reached. reject https://foo.com/' }),
      'Rate limit reached, please try again later.',
      'The correct error is shown when regular expression overrides match'
    );
  });

  test('no message', function(assert) {
    assert.expect(3);

    let status = 500,
      detail = null;

    assert.equal(
      getApiErrMsg({ status, detail }),
      'Server Error',
      'The default error msg is displayed when error.detail is falsey'
    );

    detail = {};
    assert.equal(
      getApiErrMsg({ status, detail }),
      'Server Error',
      'The default error msg is displayed when error.detail is an object without a description'
    );

    assert.equal(getApiErrMsg(), 'Server Error', 'The default error msg is displayed when error is falsey');
  });

  test('_getErrorText', function(assert) {
    assert.expect(5);

    let detail = 'String Details';

    assert.equal(_getErrorText({ detail }), detail, '_getErrorText returns the detail property if it is a string');

    detail = { description: 'Object  Details' };
    assert.equal(
      _getErrorText({ detail }),
      detail.description,
      '_getErrorText returns the detail.description property if detail is an object'
    );

    detail = {};
    assert.equal(
      _getErrorText({ detail }),
      undefined,
      '_getErrorText returns undefined if detail is an object without a description property'
    );

    detail = null;
    assert.equal(_getErrorText({ detail }), null, '_getErrorText returns null if detail is falsey');

    assert.equal(_getErrorText(), null, '_getErrorText returns null if error is falsey');
  });
});
