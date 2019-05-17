self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'ember-views.curly-components.jquery-element' },
    { handler: 'silence', matchId: 'ember-name-key-usage' },
    { handler: 'silence', matchId: 'computed-property.volatile' },
    { handler: 'silence', matchId: 'computed-property.override' },
    { handler: 'silence', matchId: 'remove-handler-infos' },
    { handler: 'silence', matchId: 'ember-inflector.globals' },
    { handler: 'silence', matchId: 'application-controller.router-properties' },
    { handler: 'silence', matchId: 'ember-component.send-action' },
    { handler: 'silence', matchId: 'transition-state' },
    { handler: 'silence', matchId: 'events.remove-all-listeners' },
    { handler: 'silence', matchId: 'ember-views.event-dispatcher.jquery-event' },
    { handler: 'silence', matchId: 'ember-power-select-test-support-clickTrigger' },
    { handler: 'silence', matchId: 'ember-power-select-test-support-nativeMouseUp' },
    { handler: 'silence', matchId: 'object.new-constructor' }
  ]
};
