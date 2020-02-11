self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'ember-views.curly-components.jquery-element' }, //caused by ember-ajax
    { handler: 'silence', matchId: 'ember-component.send-action' } // caused by ember-collection
  ]
};
