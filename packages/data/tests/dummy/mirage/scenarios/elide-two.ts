// TODO: Replace any with type supplied by new version of mirage
import { grains } from './elide-one';
import { capitalize } from '@ember/string';

const timeDimIds = ['eventTime', 'orderTime'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function(server: any) {
  const [table0, table1] = server.createList('table', 2);
  server.createList('metric', 1, { table: table0 });
  server.createList('metric', 2, { table: table1 });
  server.createList('dimension', 2, { table: table0 });
  server.createList('dimension', 4, { table: table1 });
  const timeDimTables = [table1];
  grains.forEach(grain => {
    timeDimIds.forEach(timeDimId => {
      timeDimTables.forEach(table => {
        const idWithGrain = `${table.id}.${timeDimId}${capitalize(grain)}`;
        let newGrain = server.create('time-dimension-grain', {
          id: `${idWithGrain}.${grain}`,
          expression: null,
          grain: grain.toUpperCase()
        });
        server.create('time-dimension', { id: idWithGrain, table, supportedGrain: [newGrain] });
      });
    });
  });
}
