self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'ember-views.curly-components.jquery-element' },
    { handler: 'silence', matchId: 'computed-property.volatile' },
    { handler: 'silence', matchId: 'ember-name-key-usage' },
    { handler: 'silence', matchId: 'ember-inflector.globals' },
    { handler: 'silence', matchId: 'computed-property.override' },
    { handler: 'silence', matchId: 'ember-component.send-action' },
    { handler: 'silence', matchId: 'transition-state' },
    { handler: 'silence', matchId: 'ember-console.deprecate-logger' },
    { handler: 'silence', matchId: 'application-controller.router-properties' },
    { handler: 'silence', matchId: 'ember-polyfills.deprecate-merge' },
    { handler: 'silence', matchId: 'ember-power-select-test-support-clickTrigger' },
    { handler: 'silence', matchId: 'ember-power-select-test-support-nativeMouseUp' }
  ]
};
