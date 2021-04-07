/* eslint-disable */
self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'ember-views.curly-components.jquery-element' },
    { handler: 'silence', matchId: 'computed-property.override' },
    { handler: 'silence', matchId: 'remove-handler-infos' },
    { handler: 'silence', matchId: 'application-controller.router-properties' },
    { handler: 'silence', matchId: 'ember-component.send-action' },
    { handler: 'silence', matchId: 'events.remove-all-listeners' },
    { handler: 'silence', matchId: 'ember-views.event-dispatcher.jquery-event' },
    { handler: 'silence', matchId: 'object.new-constructor' },
    { handler: 'silence', matchId: 'deprecate-fetch-ember-data-support' },
    { handler: 'silence', matchId: 'ember-metal.get-with-default' },
    { handler: 'silence', matchId: 'ember-data:model.toJSON' },
  ],
};
