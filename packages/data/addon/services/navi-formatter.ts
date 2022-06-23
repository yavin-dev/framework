/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import FormatterService from '@yavin/client/services/formatter';
import { getOwner } from '@ember/application';
import { waitForPromise } from '@ember/test-waiters';
import { maybeHalt } from '@yavin/client/utils/task';
import { task, TaskGenerator } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import type ColumnMetadataModel from '@yavin/client/models/metadata/column';
import type { Parameters } from '@yavin/client/request';

export default class NaviFormatterService extends FormatterService {
  formatNiceColumnName(columnMetadata?: ColumnMetadataModel, parameters?: Parameters, alias?: string | null) {
    return taskFor(this.taskWrapper).perform(() =>
      super.formatNiceColumnName(columnMetadata, parameters, alias)
    ) as Promise<string>;
  }

  @task *taskWrapper<T>(taskLike: () => Promise<T>): TaskGenerator<T> {
    const result = taskLike();
    try {
      /**
       * Wrap promise because waitForPromise assumes they are unique
       * and services might cache and return the same promise
       */
      return yield waitForPromise(result.then((v) => Promise.resolve(v)));
    } finally {
      yield waitForPromise(maybeHalt(result));
    }
  }

  static create(args: unknown) {
    const owner = getOwner(args);
    const yavinClient = owner.lookup('service:yavin-client');
    return new this(yavinClient.injector);
  }
}

declare module '@ember/service' {
  interface Registry {
    'navi-formatter': NaviFormatterService;
  }
}
