export default function(server) {
  /*
    Seed your development database using your factories.
    This data will not be loaded in your tests.
  */
  const [table0, table1] = server.createList('table', 2);
  server.createList('metric', 2, { table: table0 });
  server.createList('metric', 2, { table: table1 });
  server.create('dimension', { table: table0 });
}
