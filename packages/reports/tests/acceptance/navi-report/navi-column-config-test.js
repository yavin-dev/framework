import { module, test } from 'qunit';
import { findAll, visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import config from 'ember-get-config';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { clickItem } from 'navi-reports/test-support/report-builder';
import { animationsSettled } from 'ember-animated/test-support';

module('Acceptance | Navi Report | Column Config', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    config.navi.FEATURES.enableRequestPreview = true;
  });

  hooks.afterEach(function() {
    config.navi.FEATURES.enableRequestPreview = false;
  });

  test('Existing report loads correct columns', async function(assert) {
    assert.expect(1);
    await visit('reports/1/view');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Property', 'Ad Clicks', 'Nav Link Clicks'],
      'Existing report loads columns correctly'
    );
  });

  test('New report loads correct columns', async function(assert) {
    assert.expect(3);
    await visit('reports/new');

    assert.dom('.navi-column-config').doesNotExist('The column config does not exist until the report has been run');
    await click('.navi-report__run-btn');

    assert.dom('.navi-column-config').exists('The column config exists after running the report');
    await animationsSettled();
    assert.deepEqual(getColumns(), ['Date Time (Day)'], 'Initially only the date time is visible');
  });

  test('time grain - switching and removing', async function(assert) {
    assert.expect(5);
    await visit('reports/1/view');

    assert.dom('.filter-builder__subject').hasText('Date Time (Day)', 'Time grain is initially day');

    await click(findAll('.navi-column-config-item__remove-icon')[0]); // Remove Date Time (Day)

    assert.dom('.filter-builder__subject').hasText('Date Time (All)', 'Deselecting day changes time grain to all');
    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Property', 'Ad Clicks', 'Nav Link Clicks'],
      'Date Time is removed after selecting All timegrain'
    );

    await clickItem('timeGrain', 'Week');

    await animationsSettled();
    assert
      .dom('.filter-builder__subject')
      .hasText('Date Time (Week)', 'Clicking week changes timegrain from all to week');
    assert.deepEqual(
      getColumns(),
      ['Date Time (Week)', 'Property', 'Ad Clicks', 'Nav Link Clicks'],
      'Date Time can be added back'
    );
  });

  test('metrics - adding', async function(assert) {
    assert.expect(3);
    await visit('reports/new');
    await click('.navi-report__run-btn');

    assert.deepEqual(getColumns(), ['Date Time (Day)'], 'Initially only the date time is visible');
    await clickItem('metric', 'Ad Clicks');
    await clickItem('metric', 'Nav Link Clicks');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks'],
      'Metrics are added after date time'
    );

    await clickItem('metric', 'Ad Clicks');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'Duplicate metrics can be added'
    );
  });

  test('metrics - removing from start and end', async function(assert) {
    assert.expect(3);
    await visit('reports/new');
    await click('.navi-report__run-btn');

    await clickItem('metric', 'Ad Clicks');
    await clickItem('metric', 'Nav Link Clicks');
    await clickItem('metric', 'Ad Clicks');
    await clickItem('metric', 'Nav Link Clicks');
    await clickItem('metric', 'Ad Clicks');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'Duplicate metrics can be added'
    );

    await click(findAll('.navi-column-config-item__remove-icon')[1]); // Remove first Ad Clicks

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Nav Link Clicks', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'Duplicate metrics can be added'
    );

    await click(findAll('.navi-column-config-item__remove-icon')[4]); // Remove last Ad Clicks

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Nav Link Clicks', 'Ad Clicks', 'Nav Link Clicks'],
      'Duplicate metrics can be added'
    );
  });

  test('dimensions - adding', async function(assert) {
    assert.expect(3);
    await visit('reports/new');
    await click('.navi-report__run-btn');

    assert.deepEqual(getColumns(), ['Date Time (Day)'], 'Initially only the date time is visible');
    await clickItem('dimension', 'Age');
    await clickItem('dimension', 'Browser');

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Date Time (Day)', 'Age', 'Browser'], 'Dimensions are added after date time');

    await clickItem('dimension', 'Age');

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Date Time (Day)', 'Age', 'Browser', 'Age'], 'Duplicate dimensions can be added');
  });

  test('dimensions - removing from start and end', async function(assert) {
    assert.expect(3);
    await visit('reports/new');
    await click('.navi-report__run-btn');

    await clickItem('dimension', 'Age');
    await clickItem('dimension', 'Browser');
    await clickItem('dimension', 'Age');
    await clickItem('dimension', 'Browser');
    await clickItem('dimension', 'Age');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Age', 'Browser', 'Age', 'Browser', 'Age'],
      'Duplicate metrics can be added'
    );

    await click(findAll('.navi-column-config-item__remove-icon')[1]); // Remove first age

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Browser', 'Age', 'Browser', 'Age'],
      'Duplicate metrics can be added'
    );

    await click(findAll('.navi-column-config-item__remove-icon')[4]); // Remove last age

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Date Time (Day)', 'Browser', 'Age', 'Browser'], 'Duplicate metrics can be added');
  });

  test('metrics and dimensions - adding', async function(assert) {
    assert.expect(2);
    await visit('reports/new');
    await click('.navi-report__run-btn');

    assert.deepEqual(getColumns(), ['Date Time (Day)'], 'Initially only the date time is visible');
    await clickItem('metric', 'Ad Clicks');
    await clickItem('dimension', 'Age');
    await clickItem('dimension', 'Browser');
    await clickItem('metric', 'Nav Link Clicks');
    await clickItem('metric', 'Ad Clicks');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Age', 'Browser', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'timegrain, then dimensions, then metrics are displayed in the column config'
    );
  });

  function getColumns() {
    return findAll('.navi-column-config-item__name').map(el => el.textContent.trim());
  }
});
