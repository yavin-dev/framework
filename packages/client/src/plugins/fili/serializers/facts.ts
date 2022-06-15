/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A serializer for the bard response
 */

import NaviFactSerializer, { ResponseV1 } from '../../../serializers/facts/interface.js';
import type { RequestV2, Column } from '../../../request.js';
import { canonicalizeColumn } from '../../../utils/column.js';
import NaviFactResponse from '../../../models/navi-fact-response.js';
import NaviAdapterError, { NaviErrorDetails } from '../../../errors/navi-adapter-error.js';
import { FactAdapterError } from '../../../adapters/facts/interface.js';
import { FetchError } from '../../../errors/fetch-error.js';
import NativeWithCreate, { getInjector } from '../../../models/native-with-create.js';
import invariant from 'tiny-invariant';

type BardError = {
  description: string;
  druidQuery: Record<string, unknown>;
  reason: string;
  requestId: string;
  status: number;
  statusName: string;
};

export default class FiliFactsSerializer extends NativeWithCreate implements NaviFactSerializer {
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

    const injector = getInjector(this);
    invariant(injector, 'injector exists');
    return new NaviFactResponse(injector, { rows, meta });
  }

  normalize(payload: ResponseV1, request: RequestV2): NaviFactResponse | undefined {
    return payload ? this.processResponse(payload, request) : undefined;
  }

  protected readonly errorMsgOverrides: Record<string, string> = {
    '^The adapter operation timed out$': 'Data Timeout',
    '^The fetch operation timed out$': 'Data Timeout',
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

  extractError(error: FetchError | Error, _request: RequestV2): NaviAdapterError {
    let errorDetails: NaviErrorDetails = {};
    if (error instanceof FetchError) {
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
