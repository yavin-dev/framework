export default function(server) {
  const [table0, table1] = server.createList('table', 2);
  server.createList('metric', 2, { table: table0 });
  server.createList('metric', 2, { table: table1 });
  server.create('dimension', { table: table0 });
  server.create('time-dimension', { table: table1 });
}
