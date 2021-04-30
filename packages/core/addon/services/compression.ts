/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Service for converting an Ember Data model into a URL safe string
 */
import Service, { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
//@ts-ignore
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type StoreService from '@ember-data/store';
import type Model from '@ember-data/model';
import type Serializer from '@ember-data/serializer';

type EmberJSONAPIModelLike = Record<string, unknown> & { data?: { id?: string; type?: string } };

export default class CompressionService extends Service {
  @service declare store: StoreService;

  /**
   * @param obj - object to compress
   * @return promise that resolves to a string representation of object safe for URL use
   */
  async compress(obj: object): Promise<string> {
    const payload = JSON.stringify(obj);
    return compressToEncodedURIComponent(payload);
  }

  /**
   * @param string - result of a previous call to `compress`
   * @return promise that resolves to an object
   */
  async decompress(string: string): Promise<object> {
    const jsonStr = decompressFromEncodedURIComponent(decodeURIComponent(string));
    return JSON.parse(jsonStr);
  }

  /**
   * @param model - ember data model with id
   * @return promise that resolves to a string representation of model safe for URL use
   */
  async compressModel(model: Model): Promise<string> {
    const serializedModel = model.serialize({ includeId: true }) as EmberJSONAPIModelLike;

    // Ember Data requires an id to push to the store
    assert('A model given to `compress` must have an id.', serializedModel.data && serializedModel.data.id);
    return this.compress(serializedModel);
  }

  /**
   * @param string - result of a previous call to `compress`
   * @return promise that resolvs to a new ember data model
   */
  async decompressModel(string: string): Promise<Model> {
    const modelPayload = (await this.decompress(string)) as EmberJSONAPIModelLike;

    assert('A decompressed model must have a type.', modelPayload.data && modelPayload.data.type);

    //@ts-ignore
    const serializer = this.store.serializerFor('application') as Serializer;
    //@ts-ignore
    const normalizedPayload = serializer._normalizeDocumentHelper(modelPayload) as object;

    return this.store.push(normalizedPayload) as Model;
  }
}
