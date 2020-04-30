/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import attr from 'ember-data/attr';
import Fragment from 'ember-data-model-fragments/fragment';
import { validator, buildValidations } from 'ember-cp-validations';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { assert } from '@ember/debug';
import { isPresent } from '@ember/utils';

const Validations = buildValidations({
  field: validator('presence', {
    presence: true,
    message: 'The `field` field cannot be empty'
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

  @service('bard-metadata')
  metadataService;

  /**
   * Datasource or namespace
   * @property {string}
   */
  source;

  /**
   * 'metric', 'dimension', 'timeDimension' used to look up metadata;
   * @property {string}
   */
  columnMetaType;

  /**
   * @type {Meta}
   */
  @computed('field', 'columnMetaType')
  get columnMeta() {
    assert('Source must be set in order to access columnMeta', isPresent(this.source));
    assert('columnMetaType must be set in order to access columnMeta', isPresent(this.columnMetaType));
    if (this.lookupField === 'dateTime') {
      return {
        id: 'dateTime',
        name: 'Date Time'
      };
    }
    return this.metadataService.getById(this.columnMetaType, this.lookupField, this.source);
  }

  /**
   * Field without dimension subfield
   * @type {string}
   */
  get lookupField() {
    return this.field.split('.')[0];
  }

  /**
   * Adds meta data to the fragment given column type and namespace
   * @param {string} columnMetaType - 'dimension or metric'
   * @param {string} source
   * @return {void}
   */
  applyMeta(columnMetaType, source) {
    this.columnMetaType = columnMetaType;
    this.source = source;
  }
}
