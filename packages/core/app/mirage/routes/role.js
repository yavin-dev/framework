import moment from 'moment';

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export default function () {
  /**
   * roles/:id - GET endpoint to fetch role by id
   */
  this.get('/roles/:id');

  /**
   * roles/ - GET endpoint to fetch many roles
   */
  this.get('/roles');

  /**
   * roles/ -  POST endpoint to add a new role
   */
  this.post('/roles', function ({ roles, db }) {
    const attrs = this.normalizedRequestAttrs();
    const role = roles.create(attrs);

    // Init properties
    db.roles.update(role.id, {
      createdOn: moment.utc().format(TIMESTAMP_FORMAT),
      updatedOn: moment.utc().format(TIMESTAMP_FORMAT),
    });

    return role;
  });

  /**
   * roles/:id -  PATCH endpoint for an existing role
   */
  this.patch('/roles/:id');

  /**
   * roles/:id -  DELETE endpoint for an existing role
   */
  this.delete('/roles/:id');
}
