/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Navi facts service that executes and delivers the results
 */
import { getOwner } from '@ember/application';
import { waitForPromise } from '@ember/test-waiters';
import type { RequestOptions } from '@yavin/client/adapters/facts/interface';
import type { RequestV2 } from '@yavin/client/request';
import NaviFactResponse from '@yavin/client/models/navi-fact-response';
import { maybeHalt } from '@yavin/client/utils/task';
import FactService from '@yavin/client/services/fact';
import { task, TaskGenerator } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import type NaviFacts from '@yavin/client/models/navi-facts';

export default class NaviFactsService extends FactService {
  getDownloadURL(request: RequestV2, options: RequestOptions) {
    return taskFor(this.taskWrapper).perform(() => super.getDownloadURL(request, options)) as Promise<string>;
  }

  fetch(request: RequestV2, options: RequestOptions = {}) {
    return taskFor(this.taskWrapper).perform(() => super.fetch(request, options)) as Promise<NaviFacts>;
  }

  fetchNext(response: NaviFactResponse, request: RequestV2) {
    return taskFor(this.taskWrapper).perform(() => super.fetchNext(response, request)) as Promise<NaviFacts | null>;
  }

  fetchPrevious(response: NaviFactResponse, request: RequestV2) {
    return taskFor(this.taskWrapper).perform(() => super.fetchPrevious(response, request)) as Promise<NaviFacts | null>;
  }

  @task *taskWrapper<T>(taskLike: () => Promise<T>): TaskGenerator<T> {
    const result = taskLike();
    try {
      // Wrap promise value since waitForPromise assumes they are unique
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
    'navi-facts': NaviFactsService;
  }
}
