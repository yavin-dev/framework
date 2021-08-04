/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import DS from 'ember-data';
import Fragment from 'ember-data-model-fragments/fragment';
import { validator, buildValidations } from 'ember-cp-validations';
import { fragmentArray } from 'ember-data-model-fragments/attributes';
import { Copyable } from 'ember-copy';

const Validations = buildValidations({
  columns: [validator('has-many')],
  grandTotal: validator('presence', true)
});

export default Fragment.extend(Copyable, Validations, {
  columns: fragmentArray('bard-request/fragments/dimension', { defaultValue: () => [] }),
  grandTotal: DS.attr('boolean', { defaultValue: false }),
  copy() {
    return this.store.createFragment('bard-request/fragments/rollup', {
      columns: this.columns.map(dim =>
        this.store.createFragment('bard-request/fragments/dimension', { dimension: dim.dimensions })
      ),
      grandTotal: this.grandTotal
    });
  }
});
