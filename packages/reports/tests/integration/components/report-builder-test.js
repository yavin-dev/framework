import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll } from '@ember/test-helpers';
import { helper } from '@ember/component/helper';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import TableMetadataModel from 'navi-data/models/metadata/table';
import config from 'ember-get-config';

let MetadataService, Store;

const TEMPLATE = hbs`<ReportBuilder @report={{this.report}} />`;
module('Integration | Component | report builder', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    MetadataService = this.owner.lookup('service:navi-metadata');
    Store = this.owner.lookup('service:store');

    this.owner.__container__.registry.registrations['helper:update-report-action'] = helper(() => () => {});

    await MetadataService.loadMetadata();
    this.set(
      'report',
      Store.createRecord('report', {
        request: Store.createFragment('bard-request-v2/request', {
          table: 'tableA',
          dataSource: 'bardOne',
          limit: null,
          requestVersion: '2.0',
          filters: [],
          columns: [],
          sorts: [],
        }),
        visualization: {},
      })
    );
  });

  test('Single table in meta still shows datasource selector', async function (assert) {
    assert.expect(5);

    const originalDataSources = config.navi.dataSources;
    config.navi.dataSources = [
      {
        name: 'bardOne',
        displayName: 'Bard One',
        description: 'Interesting User Insights',
        uri: 'https://data.naviapp.io',
        type: 'bard',
      },
    ];

    //reset meta data and load only one table
    MetadataService.keg.resetByType('metadata/table');
    MetadataService.loadMetadataForType(
      'table',
      [
        TableMetadataModel.create({
          id: 'tableA',
          name: 'Table A',
          description: 'Table A',
          source: 'bardOne',
          metricIds: [],
          dimensionIds: [],
          timeDimensionIds: [],
          requestConstraintIds: [],
        }),
      ],
      'bardOne'
    );

    await render(TEMPLATE);

    assert.dom('.report-builder__main').isVisible('Report builder renders');
    assert.dom('.report-builder-sidebar__back').exists('The back button exists even with only one table');

    await click('.report-builder-sidebar__back');
    assert.deepEqual(
      findAll('.report-builder-source-selector__source-name').map((el) => el.textContent.trim()),
      ['Table A'],
      'The only table is shown'
    );

    assert.dom('.report-builder-sidebar__back').exists('The back button exists even with only one datasource');
    await click('.report-builder-sidebar__back');
    assert.deepEqual(
      findAll('.report-builder-source-selector__source-name').map((el) => el.textContent.trim()),
      ['Bard One'],
      'The only data source is shown'
    );
    config.navi.dataSources = originalDataSources;
  });
});
