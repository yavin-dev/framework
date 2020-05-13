import Mirage from 'ember-cli-mirage';
import moment from 'moment';
import RESPONSE_CODES from '../enums/response-codes';

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export default function() {
  /**
   * invites/:id - GET endpoint to fetch invite by id
   */
  this.get('/invites/:id', function({ invites }, request) {
    let id = request.params.id,
      invite = invites.find(id);

    if (!invite) {
      return new Mirage.Response(RESPONSE_CODES.NOT_FOUND, {}, { errors: [`Unknown identifier '${id}'`] });
    }

    return invite;
  });

  /**
   * invites/ - GET endpoint to fetch many invites
   */
  this.get('/invites', function({ invites }, request) {
    let idFilter = request.queryParams['filter[invites.id]'];

    // Allow filtering
    if (idFilter) {
      let ids = idFilter.split(',');
      invites = invites.find(ids);
    } else {
      invites = invites.all();
    }

    return invites;
  });

  /**
   * invites/ -  POST endpoint to add a new invite
   */
  this.post('/invites', function({ invites, db }) {
    let attrs = this.normalizedRequestAttrs(),
      invite = invites.create(attrs);

    // Init properties
    db.invites.update(invite.id, {
      createdOn: moment.utc().format(TIMESTAMP_FORMAT),
      updatedOn: moment.utc().format(TIMESTAMP_FORMAT)
    });

    return invite;
  });

  /**
   * invites/:id -  PATCH endpoint for an existing invite
   */
  this.patch('/invites/:id');
}
