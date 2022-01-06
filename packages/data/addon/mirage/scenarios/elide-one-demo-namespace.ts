/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { grains } from './elide-one';
import { capitalize } from '@ember/string';

const timeDimIds = ['eventTime', 'orderTime'];
export const demoNamespaceAttrs = {
  id: 'DemoNamespace',
  name: 'DemoNamespace',
  friendlyName: 'Demo Namespace',
  description: 'Demo Namespace',
};

// TODO: Replace any with type supplied by new version of mirage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function (server: any) {
  const namespace = server.create('elide-namespace', demoNamespaceAttrs);
  const [table0, table1] = server.createList('elide-table', 2, { namespace });
  server.create('elide-metric', { table: table0 });
  server.createList('elide-metric', 2, { table: table1 });
  server.createList('elide-dimension', 2, { table: table0 });
  server.create('elide-table-source');
  server.create('elide-dimension', { table: table1 });
  const timeDimTables = [table1];
  grains.forEach((grain) => {
    timeDimIds.forEach((timeDimId) => {
      timeDimTables.forEach((table) => {
        const idWithGrain = `${table.id}.${timeDimId}${capitalize(grain)}`;
        let newGrain = server.create('elide-time-dimension-grain', {
          id: `${idWithGrain}.${grain}`,
          expression: null,
          grain: grain.toUpperCase(),
        });
        server.create('elide-time-dimension', { id: idWithGrain, table, supportedGrainIds: [newGrain.id] });
      });
    });
  });
}
