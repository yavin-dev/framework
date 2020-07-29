/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import attr from 'ember-data/attr';
import Fragment from 'ember-data-model-fragments/fragment';
import { validator, buildValidations } from 'ember-cp-validations';
import { inject as service } from '@ember/service';
import { set, computed } from '@ember/object';
import { assert } from '@ember/debug';
import { isPresent } from '@ember/utils';
import { canonicalizeMetric } from 'navi-data/utils/metric';

const Validations = buildValidations({
  field: validator('presence', {
    presence: true,
    message: 'The `field` field cannot be empty'
  }),
  type: validator('inclusion', {
    in: ['dimension', 'metric', 'time-dimension'],
    allowBlank: true,
    message() {
      const { field } = this.model;
      return 'The `type` field of `' + field + '` column must equal to `dimension`, `metric`, or `time-dimension`';
    }
  })
});

export default class Base extends Fragment.extend(Validations) {
  @attr('string') field;
  @attr({
    defaultValue() {
      return {};
    }
  })
  parameters;
  @attr('string') type;
  @attr('string') source;

  @service('bard-metadata')
  metadataService;

  /**
   * @type {Meta}
   */
  @computed('field', 'type', 'source')
  get columnMetadata() {
    assert('Source must be set in order to access columnMetadata', isPresent(this.source));
    assert('column type must be set in order to access columnMetadata', isPresent(this.type));
    if (this.field === 'dateTime') {
      return {
        id: 'dateTime',
        name: 'Date Time'
      };
    }
    return this.metadataService.getById(this.type, this.field, this.source);
  }

  @computed('field', 'parameters.{}')
  get canonicalName() {
    const { field: metric, parameters } = this;

    // TODO rename with generic canonicalizeColumn
    return canonicalizeMetric({
      metric,
      parameters
    });
  }

  updateParameters(parameters = {}) {
    set(this, 'parameters', { ...this.parameters, ...parameters });
  }
}
