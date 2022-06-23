/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { Client } from '@yavin/client';
import config from 'ember-get-config';
import { getInjector } from '@yavin/client/models/native-with-create';
import type NaviMetadataAdapter from '@yavin/client/adapters/metadata/interface';
import type MetadataSerializer from '@yavin/client/serializers/metadata/interface';
import type NaviFactAdapter from '@yavin/client/adapters/facts/interface';
import type NaviFactSerializer from '@yavin/client/serializers/facts/interface';
import type NaviDimensionAdapter from '@yavin/client/adapters/dimensions/interface';
import type NaviDimensionSerializer from '@yavin/client/serializers/dimensions/interface';
import type { ServicePlugins } from '@yavin/client/config/service-plugins';

export default class YavinClientService extends Service {
  #client: Client;
  constructor() {
    super(...arguments);
    const dataSourcePlugins = this.#getDataSourcePlugins();
    const servicePlugins = this.#getServicePlugins();
    this.#client = new Client(config.navi, {
      dataSourcePlugins,
      servicePlugins,
    });
  }

  #getDataSourcePlugins() {
    const owner = getOwner(this);
    const configuredDataSources = config.navi.dataSources.map(({ type }) => type);
    const defaultDataSources = ['bard', 'elide'];
    const allDataSources = [...new Set([...defaultDataSources, ...configuredDataSources])];

    const getServicePlugin = <Adapter, Serializer>(service: string, type: string) => {
      return {
        adapter: () => owner.lookup(`adapter:${service}/${type}`) as Adapter,
        serializer: () => owner.lookup(`serializer:${service}/${type}`) as Serializer,
      };
    };
    const getDataSourcePlugin = (type: string) => ({
      metadata: getServicePlugin<NaviMetadataAdapter, MetadataSerializer>('metadata', type),
      facts: getServicePlugin<NaviFactAdapter, NaviFactSerializer>('facts', type),
      dimensions: getServicePlugin<NaviDimensionAdapter, NaviDimensionSerializer>('dimensions', type),
    });

    return Object.fromEntries(allDataSources.map((type) => [type, getDataSourcePlugin(type)]));
  }

  #getServicePlugins(): ServicePlugins {
    const owner = getOwner(this);

    return {
      requestDecorator: () => owner.lookup('service:request-decorator'),
      formatter: () => owner.lookup('service:navi-formatter'),
      facts: () => owner.lookup('service:navi-facts'),
      metadata: () => owner.lookup('service:navi-metadata'),
      dimensions: () => owner.lookup('service:navi-dimension'),
    };
  }

  get facts() {
    return this.#client.facts;
  }
  get metadata() {
    return this.#client.metadata;
  }
  get dimensions() {
    return this.#client.dimensions;
  }
  get clientConfig() {
    return this.#client.clientConfig;
  }
  get pluginConfig() {
    return this.#client.pluginConfig;
  }

  get injector() {
    return getInjector(this.#client);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'yavin-client': YavinClientService;
  }
}
