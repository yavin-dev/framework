/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { capitalize } from '@ember/string';

export const grains = ['hour', 'day', 'week', 'month', 'quarter', 'year'];
export const defaultNamespaceAttrs = {
  id: 'default',
  name: 'default',
  friendlyName: 'default',
  description: 'Default Namespace',
};
const timeDimIds = ['eventTime', 'orderTime'];

// TODO: Replace any with type supplied by new version of mirage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function (server: any) {
  const namespace = server.create('elide-namespace', defaultNamespaceAttrs);
  const [table0, table1] = server.createList('elide-table', 2, { namespace });
  server.createList('elide-metric', 3, { table: table0 });
  server.createList('elide-metric', 2, { table: table1 });
  server.createList('elide-dimension', 2, { table: table0 });
  server.create('elide-table-source');
  server.create('elide-dimension', { table: table0 });
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
