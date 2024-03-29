/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { attr } from '@ember-data/model';
import Fragment from 'ember-data-model-fragments/fragment';
import { validator, buildValidations } from 'ember-cp-validations';
import { inject as service } from '@ember/service';
import { set, computed } from '@ember/object';
import { assert } from '@ember/debug';
import { isPresent } from '@ember/utils';
import { canonicalizeColumn } from '@yavin/client/utils/column';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import type { Parameters } from '@yavin/client/request';
import { ColumnType } from '@yavin/client/models/metadata/column';
import type MetadataModelRegistry from '@yavin/client/models/metadata/registry';
import NaviFormatterService from 'navi-data/services/navi-formatter';

const Validations = buildValidations({
  field: validator('presence', {
    presence: true,
    message: 'The `field` field cannot be empty',
  }),
  type: validator('inclusion', {
    in: ['dimension', 'metric', 'timeDimension'],
    allowBlank: true,
    message() {
      const { field } = this.model;
      return 'The `type` field of `' + field + '` column must equal to `dimension`, `metric`, or `timeDimension`';
    },
  }),
});

export type ColumnMetadataModels = MetadataModelRegistry[ColumnType];

export default class Base<T extends ColumnType> extends Fragment.extend(Validations) {
  @service naviFormatter!: NaviFormatterService;

  @attr('string')
  field!: string;

  declare alias?: string | null;

  @attr({
    defaultValue() {
      return {};
    },
  })
  parameters!: Parameters;

  @attr('string')
  type!: T;

  @attr('string')
  source!: string; //TODO do we need this?

  @service
  naviMetadata!: NaviMetadataService;

  /**
   * @type {Meta}
   */
  get columnMetadata(): MetadataModelRegistry[T] {
    assert('Source must be set in order to access columnMetadata', isPresent(this.source));
    assert('column type must be set in order to access columnMetadata', isPresent(this.type));
    return this.naviMetadata.getById(this.type, this.field, this.source) as MetadataModelRegistry[T];
  }

  @computed('field', 'parameters.{}')
  get canonicalName() {
    const { field, parameters } = this;

    return canonicalizeColumn({ field, parameters });
  }

  updateParameters(parameters = {}) {
    set(this, 'parameters', { ...this.parameters, ...parameters });
  }

  /**
   * Column display name containing param value ids or provided alias
   */
  get displayName(): string {
    const { alias, parameters, columnMetadata } = this;
    return this.naviFormatter.formatColumnName(columnMetadata, parameters, alias);
  }

  /**
   * Promise based column display name containing param nice name values or provided alias
   */
  get displayNiceName(): Promise<string> {
    const { alias, parameters, columnMetadata } = this;
    return this.naviFormatter.formatNiceColumnName(columnMetadata, parameters, alias);
  }
}
