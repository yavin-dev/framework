// TODO: Replace any with type supplied by new version of mirage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function(server: any) {
  const [table0, table1] = server.createList('table', 2);
  server.createList('metric', 3, { table: table0 });
  server.createList('metric', 2, { table: table1 });
  server.createList('dimension', 3, { table: table0 });
  server.create('time-dimension', { table: table1 });
}
