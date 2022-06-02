/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A serializer for the bard response
 */

import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import NaviFactSerializer, { ResponseV1 } from './interface';
import type { RequestV2, Column } from '@yavin/client/request';
import { canonicalizeColumn } from '@yavin/client/utils/column';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
import NaviAdapterError, { NaviErrorDetails } from 'navi-data/errors/navi-adapter-error';
import { AjaxError } from 'ember-ajax/errors';
import { FactAdapterError } from 'navi-data/adapters/facts/interface';

type BardError = {
  description: string;
  druidQuery: Record<string, unknown>;
  reason: string;
  requestId: string;
  status: number;
  statusName: string;
};

export default class BardFactsSerializer extends EmberObject implements NaviFactSerializer {
  /**
   * Converts a column to the expected webservice name (e.g. `dimensionName(field=desc)` -> `dimensionName|desc`)
   * @param column - the requested column whose webservice name we need to find
   */
  private getFiliField(column: Column): string {
    switch (column.type) {
      case 'metric':
        return canonicalizeColumn(column);
      case 'timeDimension':
        if (column.field.endsWith('.dateTime')) {
          return 'dateTime';
        }
        return `${column.field}|${column.parameters.field}`;
      case 'dimension':
        return `${column.field}|${column.parameters.field}`;
    }
  }

  /**
   * @param payload - raw payload string
   * @param request - request v2 object
   */
  private processResponse(payload: ResponseV1, request: RequestV2): NaviFactResponse {
    const filiFields = request.columns.map((column) => this.getFiliField(column));
    const normalizedFields = request.columns.map((col) => canonicalizeColumn(col));

    const { rows: rawRows, meta } = payload;
    const totalRows = rawRows.length;
    const totalFields = normalizedFields.length;
    const rows = new Array(totalRows);

    let r = totalRows;
    while (r--) {
      const rawRow = rawRows[r];
      const newRow: Record<string, unknown> = (rows[r] = {});
      let f = totalFields;
      while (f--) {
        newRow[normalizedFields[f]] = rawRow[filiFields[f]];
      }
      if (rawRow.__rollupMask) {
        newRow.__rollupMask = rawRow.__rollupMask;
      }
    }

    return new NaviFactResponse(getOwner(this).lookup('service:client-injector'), { rows, meta });
  }

  normalize(payload: ResponseV1, request: RequestV2): NaviFactResponse | undefined {
    return payload ? this.processResponse(payload, request) : undefined;
  }

  protected readonly errorMsgOverrides: Record<string, string> = {
    '^The adapter operation timed out$': 'Data Timeout',
    '^The ajax operation timed out$': 'Data Timeout',
    '^Rate limit reached\\. .*': 'Rate limit reached, please try again later.',
  };

  private normalizeErrorMessage(message: string) {
    let normalizedMsg = message;
    Object.keys(this.errorMsgOverrides).forEach((reg) => {
      let regex = new RegExp(reg, 'gi');
      if (regex.test(message)) {
        normalizedMsg = this.errorMsgOverrides[reg];
      }
    });
    return normalizedMsg;
  }

  extractError(error: AjaxError | Error, _request: RequestV2): NaviAdapterError {
    let errorDetails: NaviErrorDetails = {};
    if (error instanceof AjaxError) {
      errorDetails.status = `${error.status}`;

      if (typeof error.payload === 'object') {
        const bardError = error.payload as BardError;
        errorDetails.id = bardError.requestId;
        errorDetails.detail = this.normalizeErrorMessage(bardError.description);
      } else {
        errorDetails.detail = this.normalizeErrorMessage(error.payload);
      }
    } else if (error instanceof FactAdapterError) {
      errorDetails.title = error.name;
      errorDetails.detail = error.message;
    }

    return new NaviAdapterError('Bard Request Failed', [errorDetails], error);
  }
}
