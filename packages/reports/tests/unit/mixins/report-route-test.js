import EmberObject from '@ember/object';
import Ember from 'ember';
import ReportRouteMixin from 'navi-reports/mixins/report-route';
import { module, test } from 'qunit';

module('Unit | Mixin | report route');

test('didUpdateVisualization', function(assert) {
  assert.expect(1);

  let ReportRouteObject = EmberObject.extend(ReportRouteMixin, Ember.ActionHandler),
    subject = ReportRouteObject.create();

  subject.set('currentModel', {});
  subject.send('didUpdateVisualization', 123);

  assert.equal(
    subject.get('currentModel.visualization'),
    123,
    'current model`s visualization is updated with the param passed to the action'
  );
});
