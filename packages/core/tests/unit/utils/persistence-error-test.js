import { getApiErrMsg } from 'navi-core/utils/persistence-error';
import { module, test } from 'qunit';

module('Unit | Utility | persistence error', function () {
  test('getApiErrMsg', function (assert) {
    assert.expect(3);

    assert.equal(getApiErrMsg({}, 'default'), 'default', 'getApiErrMsg returns the default message if no detail');

    let detail = ['Object details'];
    assert.equal(
      getApiErrMsg({ detail }),
      detail[0],
      'getApiErrMsg returns the first detail element if detail is present'
    );

    detail = ['Error: Object details'];
    assert.equal(
      getApiErrMsg({ detail }),
      'Object details',
      'getApiErrMsg returns the first formated detail element if detail is present'
    );
  });
});
