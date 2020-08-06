// TODO: Replace any with type supplied by new version of mirage
import { capitalize } from '@ember/string';

const grains = ['hour', 'day', 'week', 'month', 'quarter', 'year'];
const timeDimIds = ['eventTime', 'orderTime'];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function(server: any) {
  const [table0, table1] = server.createList('table', 2);
  server.createList('metric', 3, { table: table0 });
  server.createList('metric', 2, { table: table1 });
  server.createList('dimension', 3, { table: table0 });
  grains.forEach(grain => {
    timeDimIds.forEach(timeDimId => {
      const idWithGrain = `${timeDimId}${capitalize(grain)}`;
      let newGrain = server.create('time-dimension-grain', {
        id: `${idWithGrain}.${grain}`,
        expression: null,
        grain: grain.toUpperCase()
      });
      server.create('time-dimension', { id: idWithGrain, table: table1, supportedGrains: [newGrain] });
    });
  });
}
