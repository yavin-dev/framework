/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Service for converting an Ember Data model into a URL safe string
 */
import Service, { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
//@ts-ignore
import JsonUrl from 'json-url';
import type StoreService from '@ember-data/store';
import type Model from '@ember-data/model';
import type Serializer from '@ember-data/serializer';

interface StringCompressor {
  compress(string: string): Promise<string>;
  decompress(string: string): Promise<string>;
}
type EmberJSONAPIModelLike = object & { data?: { id?: unknown } };

export default class CompressionService extends Service {
  @service declare store: StoreService;

  /**
   * @property codec - compression library
   */
  codec: StringCompressor = new JsonUrl('lzstring');

  /**
   * @param obj - object to compress
   * @return promise that resolves to a string representation of object safe for URL use
   */
  compress(obj: object): Promise<string> {
    const payload = JSON.stringify(obj);
    return this.codec.compress(payload);
  }

  /**
   * @param string - result of a previous call to `compress`
   * @return promise that resolves to an object
   */
  decompress(string: string): Promise<object> {
    return this.codec.decompress(string).then((jsonStr) => JSON.parse(jsonStr));
  }

  /**
   * @param model - ember data model with id
   * @return promise that resolves to a string representation of model safe for URL use
   */
  compressModel(model: Model): Promise<string> {
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
    const modelPayload = await this.decompress(string);

    //@ts-ignore
    const serializer = this.store.serializerFor('application') as Serializer;
    //@ts-ignore
    const normalizedPayload = serializer._normalizeDocumentHelper(modelPayload) as object;

    return this.store.push(normalizedPayload) as Model;
  }
}
