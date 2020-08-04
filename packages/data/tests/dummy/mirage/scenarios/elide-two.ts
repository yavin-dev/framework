// TODO: Replace any with type supplied by new version of mirage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function(server: any) {
  const [table0, table1] = server.createList('table', 2);
  server.createList('metric', 1, { table: table0 });
  server.createList('metric', 1, { table: table1 });
  server.createList('dimension', 2, { table: table0 });
  server.createList('dimension', 3, { table: table1 });
  server.createList('time-dimension', 1, { table: table0 });
  server.createList('time-dimension', 1, { table: table1 });
}
