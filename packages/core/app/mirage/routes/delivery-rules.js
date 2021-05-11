import moment from 'moment';
import Response from 'ember-cli-mirage/response';
import RESPONSE_CODES from '../enums/response-codes';

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export default function () {
  /**
   * deliveryrules/:id - GET endpoint to fetch deliveryrules by id
   */
  this.get('/deliveryRules/:id', function ({ deliveryRules }, request) {
    const { id } = request.params;
    return deliveryRules.find(id);
  });

  /**
   * deliveryrules/ - GET endpoint to fetch many deliveryrules
   */
  this.get('/deliveryRules', { coalesce: true });

  /**
   * deliveryrules/ - POST endpoint to add a new deliveryrule
   */
  this.post('/deliveryRules', function ({ deliveryRules, db }) {
    const attrs = this.normalizedRequestAttrs();
    const deliveryRule = deliveryRules.create(attrs);

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
    const { id } = request.params;
    const deliveryRule = deliveryRules.find(id);
    const deliveredItemType = deliveryRule.deliveryType;
    const deliveredItems = { reports, dashboards };
    const deliveredItem = deliveredItems[`${deliveredItemType}s`].find(deliveryRule.deliveredItemId.id);
    const user = users.find(deliveryRule.ownerId);

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
