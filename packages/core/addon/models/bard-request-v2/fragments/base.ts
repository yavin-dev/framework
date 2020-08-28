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
import NaviMetadataService from 'navi-data/services/navi-metadata';
import { Parameters, ColumnType } from 'navi-data/adapters/facts/interface';
import MetadataModelRegistry from 'navi-data/models/metadata/registry';

const Validations = buildValidations({
  field: validator('presence', {
    presence: true,
    message: 'The `field` field cannot be empty'
  }),
  type: validator('inclusion', {
    in: ['dimension', 'metric', 'timeDimension'],
    allowBlank: true,
    message() {
      const { field } = this.model;
      return 'The `type` field of `' + field + '` column must equal to `dimension`, `metric`, or `timeDimension`';
    }
  })
});

export type ColumnMetadataModels = MetadataModelRegistry[ColumnType];

export default class Base extends Fragment.extend(Validations) {
  @attr('string')
  field!: string;

  @attr({
    defaultValue() {
      return {};
    }
  })
  parameters!: Parameters;

  @attr('string')
  type!: ColumnType;

  @attr('string')
  source!: string; //TODO do we need this?

  @service
  naviMetadata!: NaviMetadataService;

  /**
   * @type {Meta}
   */
  @computed('field', 'type', 'source')
  get columnMetadata() {
    assert('Source must be set in order to access columnMetadata', isPresent(this.source));
    assert('column type must be set in order to access columnMetadata', isPresent(this.type));
    return this.naviMetadata.getById(this.type, this.field, this.source) as ColumnMetadataModels;
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
