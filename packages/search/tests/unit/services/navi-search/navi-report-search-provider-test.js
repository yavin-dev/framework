import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Service | navi-report-search-provider', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    // Load metadata needed for request fragment
    await this.owner.lookup('service:bard-metadata').loadMetadata();
    this.service = this.owner.lookup('service:navi-search/navi-report-search-provider');
    const store = this.owner.lookup('service:store'),
      mockAuthor = store.createRecord('user', { id: 'ciela' });
    this.owner.register(
      'service:user',
      Service.extend({
        getUser: () => mockAuthor
      })
    );
  });

  test('it exists', function(assert) {
    const service = this.owner.lookup('service:navi-search/navi-report-search-provider');
    assert.ok(service);
  });

  test('construct full search query for reports', function(assert) {
    assert.deepEqual(
      this.service._constructSearchQuery({ title: 'Hyrule', request: 'clicks' }, 'navi_user', 'reports'),
      {
        filter: { reports: '(title==*Hyrule*,request==*clicks*);author==*navi_user*' }
      },
      'Report constructs the correct query for the api with both filter parameters and author.'
    );
  });

  test('construct only query parameters search query for reports', function(assert) {
    assert.deepEqual(
      this.service._constructSearchQuery({ title: 'Hyrule', request: 'clicks' }, null, 'reports'),
      {
        filter: { reports: '(title==*Hyrule*,request==*clicks*)' }
      },
      'Report constructs the correct query for the api with filter parameters.'
    );
  });

  test('construct only author search query for reports', function(assert) {
    assert.deepEqual(
      this.service._constructSearchQuery(null, 'navi_user', 'reports'),
      {
        filter: { reports: 'author==*navi_user*' }
      },
      'Report constructs the correct query for the api with author.'
    );
  });

  test('construct full search query for dashboards', function(assert) {
    assert.deepEqual(
      this.service._constructSearchQuery({ title: 'Hyrule' }, 'navi_user', 'dashboards'),
      {
        filter: { dashboards: '(title==*Hyrule*);author==*navi_user*' }
      },
      'Report constructs the correct query for the api with both filter parameters and author.'
    );
  });

  test('construct only query parameters search query for dashboards', function(assert) {
    assert.deepEqual(
      this.service._constructSearchQuery({ title: 'Hyrule' }, null, 'dashboards'),
      {
        filter: { dashboards: '(title==*Hyrule*)' }
      },
      'Report constructs the correct query for the api with filter parameters.'
    );
  });

  test('construct only author search query for dashboards', function(assert) {
    assert.deepEqual(
      this.service._constructSearchQuery(null, 'navi_user', 'dashboards'),
      {
        filter: { dashboards: 'author==*navi_user*' }
      },
      'Report constructs the correct query for the api with author.'
    );
  });

  test('search by user search returns reports and dashboards', async function(assert) {
    const results = this.service.search('Revenue');
    const reports = await results.reports;
    const dashboards = await results.dashboards;
    const author = await reports.get('firstObject.author.id');
    assert.ok(
      reports.get('firstObject').title.includes('Revenue'),
      'The service returns a report that includes the requested title.'
    );
    assert.ok(
      dashboards.get('firstObject').title.includes('Revenue'),
      'The service returns a dashboard that includes the requested title.'
    );
    assert.ok(author.includes('ciela'), 'The service returns a report from the requested user.');
  });

  test('search by user search returns only reports', async function(assert) {
    const results = this.service.search('Report');
    const reports = await results.reports;
    const dashboards = await results.dashboards;
    const author = await reports.get('firstObject.author.id');
    assert.ok(
      reports.get('firstObject').title.includes('Report'),
      'The service returns a report that includes the requested title.'
    );
    assert.equal(dashboards.content.length, 0, 'No dashboards are being returned when there is no match.');
    assert.ok(author.includes('ciela'), 'The service returns a report from the requested user.');
  });

  test('search by user search returns only dashboards', async function(assert) {
    const results = this.service.search('Dashboard');
    const reports = await results.reports;
    const dashboards = await results.dashboards;
    const author = await dashboards.get('firstObject.author.id');
    assert.ok(
      dashboards.get('firstObject').title.includes('Dashboard'),
      'The service returns a dashboard that includes the requested title.'
    );
    assert.equal(reports.content.length, 0, 'No reports are being returned when there is no match.');
    assert.ok(author.includes('ciela'), 'The service returns a dashboard from the requested user.');
  });

  test('search with no results for search parameters', async function(assert) {
    const results = this.service.search('something');
    const reports = await results.reports;
    const dashboards = await results.dashboards;
    assert.equal(reports.content.length, 0, 'No reports are being returned when there is no match.');
    assert.equal(dashboards.content.length, 0, 'No dashboards are being returned when there is no match.');
  });

  test('search with empty parameters', async function(assert) {
    const results = this.service.search();
    const reports = await results.reports;
    const dashboards = await results.dashboards;
    assert.equal(reports.content.length, 0, 'No reports are being returned when there is no match.');
    assert.equal(dashboards.content.length, 0, 'No dashboards are being returned when there is no match.');
  });
});
