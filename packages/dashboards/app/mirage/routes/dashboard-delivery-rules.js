import moment from 'moment';

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export default function () {
  /**
   * deliveryrules/ - POST endpoint to add a new deliveryrule
   */
  this.post('/deliveryRules', function ({ deliveryRules, db }) {
    let attrs = this.normalizedRequestAttrs(),

        deliveryRule = deliveryRules.create(attrs),
        deliveredItem = db.dashboards.find(deliveryRule.deliveredItemId),
        owner = db.users.find(deliveryRule.ownerId);

    // Update user with new deliveryRule
    db.users.update(deliveryRule.ownerId, {
      deliveryRules: owner.deliveryRules.concat([Number(deliveryRule.id)])
    });

    // Update dashboard with new deliveryRule
    db.dashboards.update(deliveryRule.deliveredItemId, {
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
   * deliveryrules/ - DELETE endpoint to delete a deliveryrule by id
   */
  this.del('/deliveryRules/:id', ({ deliveryRules, db }, request) => {
    let id = request.params.id,
        deliveryRule = deliveryRules.find(id),
        owner = db.users.find(deliveryRule.ownerId),
        deliveredItem = db.dashboards.find(deliveryRule.deliveredItemId);

    // Delete deliveryRule from user
    db.users.update(deliveryRule.ownerId, {
      deliveryRules: owner.deliveryRules.filter((id) => id.toString() !== deliveryRule.id)
    });

    // Delete deliveryRule from dashboard
    db.dashboards.update(deliveryRule.deliveredItemId, {
      deliveryRules: deliveredItem.deliveryRules.filter((id) => id.toString() !== deliveryRule.id)
    });

    deliveryRule.destroy();
  });
}
