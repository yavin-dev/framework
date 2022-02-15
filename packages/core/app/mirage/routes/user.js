import { Response } from 'miragejs';
import moment from 'moment';
import RESPONSE_CODES from '../enums/response-codes';

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export default function () {
  /**
   * users/:id - GET endpoint to fetch user by id
   */
  this.get('/users/:id', function ({ users }, request) {
    const { id } = request.params;
    const user = users.find(id);

    if (!user) {
      return new Response(RESPONSE_CODES.NOT_FOUND, {}, { errors: [`Unknown identifier '${id}'`] });
    }

    return user;
  });

  /**
   * users/ - GET endpoint to fetch many users
   */
  this.get('/users', { coalesce: true });

  /**
   * users/ -  POST endpoint to add a new user
   */
  this.post('/users', function ({ users, db }) {
    const attrs = this.normalizedRequestAttrs();
    const user = users.create(attrs);

    // Init properties
    db.users.update(user.id, {
      createdOn: moment.utc().format(TIMESTAMP_FORMAT),
      updatedOn: moment.utc().format(TIMESTAMP_FORMAT),
    });

    return user;
  });

  /**
   * users/:id -  PATCH endpoint for an existing user
   */
  this.patch('/users/:id');
}
