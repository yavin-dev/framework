import Mirage from 'ember-cli-mirage';
import moment from 'moment';
import RESPONSE_CODES from '../enums/response-codes';

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export default function() {
  /**
   * users/:id - GET endpoint to fetch user by id
   */
  this.get('/users/:id', function({ users }, request) {
    let id = request.params.id,
      user = users.find(id);

    if (!user) {
      return new Mirage.Response(RESPONSE_CODES.NOT_FOUND, {}, { errors: [`Unknown identifier '${id}'`] });
    }

    return user;
  });

  /**
   * users/ - GET endpoint to fetch many users
   */
  this.get('/users', function({ users }, request) {
    let idFilter = request.queryParams['filter[users.id]'];

    // Allow filtering
    if (idFilter) {
      let ids = idFilter.split(',');
      users = users.find(ids);
    } else {
      users = users.all();
    }

    return users;
  });

  /**
   * users/ -  POST endpoint to add a new user
   */
  this.post('/users', function({ users, db }) {
    let attrs = this.normalizedRequestAttrs(),
      user = users.create(attrs);

    // Init properties
    db.users.update(user.id, {
      createdOn: moment.utc().format(TIMESTAMP_FORMAT),
      updatedOn: moment.utc().format(TIMESTAMP_FORMAT)
    });

    return user;
  });

  /**
   * users/:id -  PATCH endpoint for an existing user
   */
  this.patch('/users/:id', function({ users }, request) {
    let { id } = request.params,
      attrs = this.normalizedRequestAttrs();

    users.find(id).update(attrs);
    return new Mirage.Response(RESPONSE_CODES.NO_CONTENT);
  });
}
