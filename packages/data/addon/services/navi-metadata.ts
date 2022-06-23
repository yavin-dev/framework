/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { getOwner } from '@ember/application';
import { waitForPromise } from '@ember/test-waiters';
import type MetadataModelRegistry from '@yavin/client/models/metadata/registry';
import type { RequestOptions } from '@yavin/client/adapters/facts/interface';
import MetadataService from '@yavin/client/services/metadata';
import { task, TaskGenerator } from 'ember-concurrency';
import { maybeHalt } from '@yavin/client/utils/task';
import { taskFor } from 'ember-concurrency-ts';

export type MetadataModelTypes = keyof MetadataModelRegistry;

export default class NaviMetadataService extends MetadataService {
  loadMetadata(options: RequestOptions = {}): Promise<void> {
    return taskFor(this.taskWrapper).perform(() => super.loadMetadata(options)) as Promise<void>;
  }

  async fetchById<K extends keyof MetadataModelRegistry>(
    type: K,
    id: string,
    dataSourceName: string
  ): Promise<MetadataModelRegistry[K] | undefined> {
    return taskFor(this.taskWrapper).perform(() => super.fetchById(type, id, dataSourceName)) as Promise<
      MetadataModelRegistry[K] | undefined
    >;
  }

  findById<K extends keyof MetadataModelRegistry>(
    type: K,
    id: string,
    dataSourceName: string
  ): Promise<MetadataModelRegistry[K] | undefined> {
    return taskFor(this.taskWrapper).perform(() => super.findById(type, id, dataSourceName)) as Promise<
      MetadataModelRegistry[K] | undefined
    >;
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

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'navi-metadata': NaviMetadataService;
  }
}
