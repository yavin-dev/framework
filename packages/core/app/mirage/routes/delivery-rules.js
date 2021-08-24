import moment from 'moment';
import Response from 'ember-cli-mirage/response';
import RESPONSE_CODES from '../enums/response-codes';
import { singularize } from 'ember-inflector';

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export default function () {
  this.get('/deliveryRules/:id', function ({ deliveryRules }, request) {
    const { id } = request.params;
    return deliveryRules.find(id);
  });

  this.get('/deliveryRules', { coalesce: true });

  this.post('/deliveryRules', function ({ deliveryRules }) {
    const attrs = this.normalizedRequestAttrs();
    const deliveryRule = deliveryRules.create({
      ...attrs,
      deliveryType: singularize(attrs.deliveredItemId.type),
      createdOn: moment.utc().format(TIMESTAMP_FORMAT),
      updatedOn: moment.utc().format(TIMESTAMP_FORMAT),
    });

    return deliveryRule;
  });

  this.patch('/deliveryRules/:id');

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
