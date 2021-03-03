import moment from 'moment';
import Response from 'ember-cli-mirage/response';
import RESPONSE_CODES from '../enums/response-codes';

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export default function () {
  /**
   * deliveryrules/:id - GET endpoint to fetch deliveryrules by id
   */
  this.get('/deliveryRules/:id', function ({ deliveryRules }, request) {
    let id = request.params.id,
      deliveryRule = deliveryRules.find(id);

    return deliveryRule;
  });

  /**
   * deliveryrules/ - GET endpoint to fetch many deliveryrules
   */
  this.get('/deliveryRules', function ({ deliveryRules }, request) {
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
  this.post('/deliveryRules', function ({ deliveryRules, db }) {
    let attrs = this.normalizedRequestAttrs(),
      deliveryRule = deliveryRules.create(attrs);

    // Init properties
    db.deliveryRules.update(deliveryRule.id, {
      createdOn: moment.utc().format(TIMESTAMP_FORMAT),
      updatedOn: moment.utc().format(TIMESTAMP_FORMAT),
    });

    return deliveryRule;
  });

  /**
   * deliveryrules/ - PATCH endpoint for an existing deliveryrule
   */
  this.patch('/deliveryRules/:id');

  /**
   * deliveryrules/ - DELETE endpoint to delete a deliveryrule by id
   */
  this.del('/deliveryRules/:id', function ({ deliveryRules, users, reports, dashboards }, request) {
    let id = request.params.id,
      deliveryRule = deliveryRules.find(id),
      deliveredItemType = deliveryRule.deliveryType,
      deliveredItems = { reports, dashboards },
      deliveredItem = deliveredItems[`${deliveredItemType}s`].find(deliveryRule.deliveredItemId.id),
      user = users.find(deliveryRule.ownerId);

    if (!deliveryRule) {
      return new Response(RESPONSE_CODES.NOT_FOUND, {}, { errors: [`Unknown identifier '${id}'`] });
    }

    // Delete delivery rule from deliveredItem
    deliveredItem.update({
      deliveryRules: deliveredItem.deliveryRules.filter((id) => id.toString() !== deliveryRule.id),
    });
    // Delete delivery rule from user
    user.update({
      deliveryRules: user.deliveryRules.filter((id) => id.toString() !== deliveryRule.id),
    });

    deliveryRule.destroy();
    return new Response(RESPONSE_CODES.NO_CONTENT);
  });
}
