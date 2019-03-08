self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'ember-name-key-usage' },
    { handler: 'silence', matchId: 'ember-polyfills.deprecate-merge' },
    { handler: 'silence', matchId: 'ember-runtime.deprecate-copy-copyable' },
    { handler: 'silence', matchId: 'ember-component.send-action' },
    { handler: 'silence', matchId: 'ember-views.event-dispatcher.jquery-event' },
    { handler: 'silence', matchId: 'events.remove-all-listeners' },
    { handler: 'silence', matchId: 'object.new-constructor' }
  ],
  throwOnUnhandled: true
};
