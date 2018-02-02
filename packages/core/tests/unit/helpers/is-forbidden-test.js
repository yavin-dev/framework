/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { isForbidden } from 'dummy/helpers/is-forbidden';
import { module, test } from 'qunit';
import { ForbiddenError, BadRequestError, ServerError } from 'ember-ajax/errors';

module('Unit | Helper | is forbidden');

test('it returns true with rejected promise with forbidden error', function(assert) {
  assert.expect(4);
  assert.ok(isForbidden(new ForbiddenError({})), "returns true if forbidden error");
  assert.notOk(isForbidden({"error": "Not Found"}), "returns false for general errors");
  assert.notOk(isForbidden(new BadRequestError({})), "returns false for bad requests");
  assert.notOk(isForbidden(new ServerError({})), "returns false for server errors");
});

test('it returns false with other data types', function(assert) {
  assert.expect(4);
  assert.notOk(isForbidden(null));
  assert.notOk(isForbidden(undefined));
  assert.notOk(isForbidden({"data": 'foo'}));
  assert.notOk(isForbidden("bullhokey"));
});

