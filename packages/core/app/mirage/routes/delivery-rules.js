import moment from 'moment';
import Mirage from 'ember-cli-mirage';
import { pluralize } from 'ember-inflector';

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export default function() {
  /**
   * deliveryrules/:id - GET endpoint to fetch deliveryrules by id
   */
  this.get('/deliveryRules/:id', ({ deliveryRules }, request) => {
    let id = request.params.id,
      deliveryRule = deliveryRules.find(id);

    return deliveryRule;
  });

  /**
   * deliveryrules/ - GET endpoint to fetch many deliveryrules
   */
  this.get('/deliveryRules', ({ deliveryRules, db }, request) => {
    let idFilter = request.queryParams['filter[delivery-rules.id]'];
    // Allow filtering
    if (idFilter) {
      let ids = idFilter.split(',');
      deliveryRules = db.deliveryRules.find(ids);
    } else {
      deliveryRules = db.deliveryRules.all();
    }

    return deliveryRules;
  });

  /**
   * deliveryrules/ - POST endpoint to add a new deliveryrule
   */
  this.post('/deliveryRules', function({ deliveryRules, db }) {
    let attrs = this.normalizedRequestAttrs(),
      deliveryRule = deliveryRules.create(attrs),
      deliveredItem = db[pluralize(deliveryRule.attrs.deliveryType)].find(deliveryRule.deliveredItemId),
      owner = db.users.find(deliveryRule.ownerId);

    // Update user with new deliveryRule
    db.users.update(deliveryRule.ownerId, {
      deliveryRules: owner.deliveryRules.concat([Number(deliveryRule.id)])
    });

    // Update report with new deliveryRule
    db[pluralize(deliveryRule.attrs.deliveryType)].update(deliveryRule.deliveredItemId, {
      deliveryRules: deliveredItem.deliveryRules.concat([Number(deliveryRule.id)])
    });

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
    return new Mirage.Response(204);
  });

  /**
   * deliveryrules/ - DELETE endpoint to delete a deliveryrule by id
   */
  this.del('/deliveryRules/:id', ({ deliveryRules, db }, request) => {
    let id = request.params.id,
      deliveryRule = deliveryRules.find(id),
      owner = db.users.find(deliveryRule.ownerId),
      deliveredItem = db[pluralize(deliveryRule.attrs.deliveryType)].find(deliveryRule.deliveredItemId);

    // Delete deliveryRule from user
    db.users.update(deliveryRule.ownerId, {
      deliveryRules: owner.deliveryRules.filter(id => id.toString() !== deliveryRule.id)
    });

    // Delete deliveryRule from report
    db[pluralize(deliveryRule.attrs.deliveryType)].update(deliveryRule.deliveredItemId, {
      deliveryRules: deliveredItem.deliveryRules.filter(id => id.toString() !== deliveryRule.id)
    });

    deliveryRule.destroy();
  });
}
