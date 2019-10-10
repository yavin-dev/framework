'use strict';

module.exports = {
  normalizeEntityName() {}, // no-op since we're just adding dependencies

  afterInstall() {
    return this.addAddonsToProject({
      packages: [
        { name: 'navi-notifications' }, // default notification provider
        { name: 'ember-font-awesome' } // default icon provider
      ]
    });
  }
};
