/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import attr from 'ember-data/attr';
import Fragment, { internalModelFor } from 'ember-data-model-fragments/fragment';
import { validator, buildValidations } from 'ember-cp-validations';
import { inject as service } from '@ember/service';
import { getDefaultDataSourceName } from 'navi-data/utils/adapter';

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

  _meta;

  /**
   * @type {Meta}
   */
  get meta() {
    if (!this._meta) {
      if (this.lookupField === 'dateTime') {
        this._meta = { id: 'dateTime', name: 'Date Time' };
        return this._meta;
      }
      const request = internalModelFor(this)._recordData.getOwner();
      const dataSource = request?.dataSource || getDefaultDataSourceName();
      const type = this.getFieldType(request);
      if (type) {
        this._meta = this.metadataService.getById(type, this.lookupField, dataSource);
      }
      //can't figure out type? then let's guess.
      ['time-dimension', 'metric', 'dimension'].some(guessType => {
        this._meta = this.metadataService.getById(guessType, this.lookupField, dataSource);
        return !!this._meta;
      });
    }

    return this._meta;
  }

  /**
   * @type {Meta}
   */
  set meta(meta) {
    this._meta = meta;
  }

  get lookupField() {
    return this.field.includes('.') ? this.field.split('.')[0] : this.field;
  }

  /**
   * Adds meta data to the fragment given column type and namespace
   * @param {string} type - 'dimension or metric'
   * @param {string} namespace
   * @return {void}
   */
  applyMeta(type, namespace) {
    this._meta = this.metadataService.getById(type, this.lookupField, namespace);
  }

  /**
   * Given a request, gives the predicted field type of this fragment by looking through columns
   * @param {bard-request-v2/Request} request - request with columns to look through
   * @returns {string}
   */
  getFieldType(request) {
    if (this.type) {
      return this.type;
    }

    //get type from request columns
    const matchingCol = request.columns.filter(col => col.field === this.field || col.field === this.lookupField)[0];
    if (matchingCol) {
      return matchingCol.type;
    }
  }
}
