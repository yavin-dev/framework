import Mirage from 'ember-cli-mirage';
import moment from 'moment';
import { jsonToJsonApi, jsonApiToJson } from './helpers';

const RESPONSE_CODES = {
  NOT_FOUND: 404,
  CREATED: 201,
  LOCKED: 423,
  NO_CONTENT: 204,
  UNPROCESSABLE_ENTITY: 422
};
const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export default function() {
  /**
   * users/:id - GET endpoint to fetch user by id
   */
  this.get('/users/:id', ({ db }, request) => {
    let id = request.params.id,
      user = db.users.find(id);

    if (!user) {
      return new Mirage.Response(RESPONSE_CODES.NOT_FOUND, {}, { errors: [`Unknown identifier '${id}'`] });
    }

    return jsonToJsonApi(user, 'users');
  });

  /**
   * users/ - GET endpoint to fetch many users
   */
  this.get('/users', ({ db }, request) => {
    let idFilter = request.queryParams['filter[users.id]'],
      users = db.users;

    // Allow filtering
    if (idFilter) {
      let ids = idFilter.split(',');
      users = db.users.find(ids);
    }

    return jsonToJsonApi(users, 'users');
  });

  /**
   * users/ -  POST endpoint to add a new user
   */
  this.post('/users', ({ db }, request) => {
    let postData = JSON.parse(request.requestBody),
      userId = postData.data.id;

    // Add user only if it does not exists
    if (db.users.find(userId)) {
      return new Mirage.Response(RESPONSE_CODES.LOCKED);
    } else {
      let user = jsonApiToJson(postData);

      Object.assign(user, { createdOn: moment.utc().format(TIMESTAMP_FORMAT) }); // add createdOn property

      db.users.insert(postData);
      return new Mirage.Response(RESPONSE_CODES.CREATED, {}, postData);
    }
  });

  /**
   * users/:id -  PATCH endpoint for an existing user
   */
  this.patch('/users/:id', ({ db }, request) => {
    let patchData = JSON.parse(request.requestBody),
      userId = patchData.data.id;

    // Update only if user exists
    if (!db.users.find(userId)) {
      return new Mirage.Response(RESPONSE_CODES.NOT_FOUND, {}, { errors: [`Unknown identifier '${userId}'`] });
    }

    let user = jsonApiToJson(patchData);
    patchData.updatedOn = moment.utc().format(TIMESTAMP_FORMAT);
    db.users.update(user.id, user);

    return new Mirage.Response(RESPONSE_CODES.NO_CONTENT);
  });
}
