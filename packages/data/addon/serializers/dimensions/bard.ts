/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import { FiliDimensionResponse, DefaultField } from 'navi-data/adapters/dimensions/bard';
import type NaviDimensionSerializer from './interface';
import type { DimensionColumn } from '@yavin/client/models/metadata/dimension';
import NaviDimensionModel from '@yavin/client/models/navi-dimension';
import NaviDimensionResponse from '@yavin/client/models/navi-dimension-response';

export default class BardDimensionSerializer extends EmberObject implements NaviDimensionSerializer {
  //TODO remove when https://github.com/yahoo/fili/issues/1088 lands
  private fieldMap: Record<string, string | undefined> = {
    desc: 'description',
  };

  private mapField(field: string) {
    return this.fieldMap[field] || field;
  }

  normalize(dimensionColumn: DimensionColumn, rawPayload: FiliDimensionResponse): NaviDimensionResponse {
    const { suggestionColumns } = dimensionColumn.columnMetadata;
    if (
      !suggestionColumns.every(({ id, parameters }) => id === dimensionColumn.columnMetadata.id && parameters?.field)
    ) {
      throw new Error('Only different fields of the same dimension may be used as suggestions');
    }
    const suggestionFields = suggestionColumns.map((c) =>
      this.mapField((c.parameters?.field as string | undefined) ?? '')
    );
    const injector = getOwner(this).lookup('service:client-injector');

    if (rawPayload?.rows.length) {
      const requestedField = this.mapField((dimensionColumn.parameters?.field as string | undefined) ?? DefaultField);
      const otherFields = suggestionFields.filter((f) => f !== requestedField);
      const values = rawPayload.rows.map(
        (row) =>
          new NaviDimensionModel(injector, {
            dimensionColumn,
            value: row[requestedField],
            suggestions: otherFields.reduce((obj, field) => ({ ...obj, [field]: row[field] }), {}),
          })
      );
      return new NaviDimensionResponse(injector, { values, meta: rawPayload.meta });
    }
    return new NaviDimensionResponse(injector, { values: [] });
  }
}
