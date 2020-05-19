import Mirage from 'ember-cli-mirage';
import moment from 'moment';
import RESPONSE_CODES from '../enums/response-codes';

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export default function() {
  /**
   * roles/:id - GET endpoint to fetch role by id
   */
  this.get('/roles/:id');

  /**
   * roles/ - GET endpoint to fetch many roles
   */
  this.get('/roles', function({ roles }, request) {
    let idFilter = request.queryParams['filter[roles.id]'];

    // Allow filtering
    if (idFilter) {
      let ids = idFilter.split(',');
      roles = roles.find(ids);
    } else {
      roles = roles.all();
    }

    return roles;
  });

  /**
   * roles/ -  POST endpoint to add a new role
   */
  this.post('/roles', function({ roles, db }) {
    let attrs = this.normalizedRequestAttrs(),
      role = roles.create(attrs);

    // Init properties
    db.roles.update(role.id, {
      createdOn: moment.utc().format(TIMESTAMP_FORMAT),
      updatedOn: moment.utc().format(TIMESTAMP_FORMAT)
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
