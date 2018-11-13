import moment from 'moment';
import Mirage from 'ember-cli-mirage';
import RESPONSE_CODES from '../enums/response-codes';

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export default function() {
  /**
   * deliveryrules/:id - GET endpoint to fetch deliveryrules by id
   */
  this.get('/deliveryRules/:id', function({ deliveryRules }, request) {
    let id = request.params.id,
      deliveryRule = deliveryRules.find(id);

    return deliveryRule;
  });

  /**
   * deliveryrules/ - GET endpoint to fetch many deliveryrules
   */
  this.get('/deliveryRules', function({ deliveryRules }, request) {
    let idFilter = request.queryParams['filter[delivery-rules.id]'],
      rules = deliveryRules;

    // Allow filtering
    if (idFilter) {
      let ids = idFilter.split(',');
      rules = deliveryRules.find(ids);
    }

    return rules;
  });

  /**
   * deliveryrules/ - POST endpoint to add a new deliveryrule
   */
  this.post('/deliveryRules', function({ deliveryRules, db }) {
    let attrs = this.normalizedRequestAttrs(),
      deliveryRule = deliveryRules.create(attrs);

    // Init properties
    db.deliveryRules.update(deliveryRule.id, {
      createdOn: moment.utc().format(TIMESTAMP_FORMAT),
      updatedOn: moment.utc().format(TIMESTAMP_FORMAT)
    });

    return deliveryRule;
  });

  /**
   * deliveryrules/ - PATCH endpoint for an existing deliveryrule
   */
  this.patch('/deliveryRules/:id', function({ deliveryRules }, request) {
    let id = request.params.id,
      attrs = this.normalizedRequestAttrs();

    deliveryRules.find(id).update(attrs);
    return new Mirage.Response(RESPONSE_CODES.NO_CONTENT);
  });

  /**
   * deliveryrules/ - DELETE endpoint to delete a deliveryrule by id
   */
  this.del('/deliveryRules/:id', function({ deliveryRules }, request) {
    let id = request.params.id,
      deliveryRule = deliveryRules.find(id);

    deliveryRule.destroy();
  });
}
