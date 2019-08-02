self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    { handler: "silence", matchId: 'ember-component.send-action' },
    { handler: "warn", matchId: "ember-views.event-dispatcher.jquery-event" },
    { handler: "silence", matchId: "deprecate-fetch-ember-data-support" }
  ]
};
