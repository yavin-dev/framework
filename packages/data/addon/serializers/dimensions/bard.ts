/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import EmberObject from '@ember/object';
import { assert } from '@ember/debug';
import { getOwner } from '@ember/application';
import NaviDimensionSerializer from './interface';
import { FiliDimensionResponse, DefaultField } from 'navi-data/adapters/dimensions/bard';
import { DimensionColumn } from 'navi-data/models/metadata/dimension';
import type NaviDimensionModel from '../../models/navi-dimension';
import type NaviDimensionResponse from 'navi-data/models/navi-dimension-response';
import type { Factory } from 'navi-data/models/native-with-create';

export default class BardDimensionSerializer extends EmberObject implements NaviDimensionSerializer {
  dimensionModelFactory = getOwner(this).factoryFor('model:navi-dimension') as Factory<typeof NaviDimensionModel>;
  responseFactory = getOwner(this).factoryFor('model:navi-dimension-response') as Factory<typeof NaviDimensionResponse>;
  //TODO remove when https://github.com/yahoo/fili/issues/1088 lands
  fieldMap: Record<string, string | undefined> = {
    desc: 'description',
  };

  mapField(field: string) {
    return this.fieldMap[field] || field;
  }

  normalize(dimensionColumn: DimensionColumn, rawPayload: FiliDimensionResponse): NaviDimensionResponse {
    const { suggestionColumns } = dimensionColumn.columnMetadata;
    assert(
      'Only different fields of the same dimension may be used as suggestions',
      suggestionColumns.every((suggestion) => {
        const { id, parameters } = suggestion;
        return (!id || id === dimensionColumn.columnMetadata.id) && parameters?.field;
      })
    );
    const suggestionFields = suggestionColumns.map((c) => this.mapField(c.parameters?.field || ''));

    if (rawPayload?.rows.length) {
      const requestedField = this.mapField(dimensionColumn.parameters?.field || DefaultField);
      const otherFields = suggestionFields.filter((f) => f !== requestedField);

      const values = rawPayload.rows.map((row) =>
        this.dimensionModelFactory.create({
          dimensionColumn,
          value: row[requestedField],
          suggestions: otherFields.map((field) => row[field]),
        })
      );
      return this.responseFactory.create({ values, meta: rawPayload.meta });
    }
    return this.responseFactory.create();
  }
}
