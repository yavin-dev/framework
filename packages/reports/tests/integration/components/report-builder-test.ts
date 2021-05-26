import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll } from '@ember/test-helpers';
import { helper } from '@ember/component/helper';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import TableMetadataModel from 'navi-data/models/metadata/table';
import config from 'ember-get-config';
//@ts-ignore
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type StoreService from '@ember-data/store';
import { Factory } from 'navi-data/addon/models/native-with-create';

let MetadataService: NaviMetadataService, Store: StoreService, TableFactory: Factory<typeof TableMetadataModel>;

const mockDataSourceA = {
  name: 'bardOne',
  displayName: 'Source A',
  description: 'Awesome Source A',
  uri: 'https://data.naviapp.io',
  type: 'bard' as const,
};
const mockDataSourceB = {
  name: 'bardTwo',
  displayName: 'Source B',
  description: 'Beautiful Source B',
  uri: 'https://data2.naviapp.io',
  type: 'bard' as const,
};

const TEMPLATE = hbs`<ReportBuilder @report={{this.report}} />`;
module('Integration | Component | report builder', function (hooks) {
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    MetadataService = this.owner.lookup('service:navi-metadata');
    Store = this.owner.lookup('service:store');

    this.owner.register(
      'helper:update-report-action',
      helper(() => () => undefined)
    );

    TableFactory = this.owner.factoryFor('model:metadata/table');

    await MetadataService.loadMetadata({ dataSourceName: mockDataSourceA.name });
    await MetadataService.loadMetadata({ dataSourceName: mockDataSourceB.name });
    this.set(
      'report',
      Store.createRecord('report', {
        request: Store.createFragment('bard-request-v2/request', {
          table: null,
          dataSource: null,
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

  test('Single datasource single table is automatically selected', async function (assert) {
    assert.expect(6);

    const originalDataSources = config.navi.dataSources;
    config.navi.dataSources = [mockDataSourceA];

    //reset meta data and load only one table
    MetadataService['keg'].resetByType('metadata/table');
    MetadataService['loadMetadataForType'](
      'table',
      [
        //@ts-expect-error
        TableFactory.create({ id: 'tableA', name: 'Table A', source: mockDataSourceA.name, isFact: true }),
        //@ts-expect-error
        TableFactory.create({ id: 'notFactTable', source: mockDataSourceA.name, isFact: false }),
      ],
      mockDataSourceA.name
    );

    assert.deepEqual(
      MetadataService.all('table', mockDataSourceA.name).map((t) => t.id),
      ['tableA', 'notFactTable'],
      'The tables are loaded correctly into the metadata'
    );

    await render(TEMPLATE);

    assert.dom('.report-builder__main').isVisible('Report builder renders');

    assert.deepEqual(
      findAll('.report-builder-sidebar__breadcrumb-item').map((el) => el.textContent?.trim()),
      ['Data Sources', 'Source A'],
      'The breadcrumb links back to dataSources and tables'
    );
    assert.dom('.report-builder-sidebar__source').hasText('Table A', 'Table A is selected');

    await click('.report-builder-sidebar__breadcrumb-item[data-level="1"]');
    assert.deepEqual(
      findAll('.report-builder-source-selector--tables .report-builder-source-selector__source-name').map((el) =>
        el.textContent?.trim()
      ),
      ['Table A'],
      'The only fact table is shown'
    );

    await click('.report-builder-sidebar__breadcrumb-item[data-level="0"]');
    await animationsSettled();
    assert.deepEqual(
      findAll('.report-builder-source-selector--datasources .report-builder-source-selector__source-name').map((el) =>
        el.textContent?.trim()
      ),
      ['Source A'],
      'The only data source is shown'
    );
    config.navi.dataSources = originalDataSources;
  });

  test('Single datasource with multiple tables only selects datasource', async function (assert) {
    assert.expect(6);

    const originalDataSources = config.navi.dataSources;
    config.navi.dataSources = [mockDataSourceB];

    //reset meta data and load only one table
    MetadataService['keg'].resetByType('metadata/table');
    MetadataService['loadMetadataForType'](
      'table',
      [
        //@ts-expect-error
        TableFactory.create({ id: 'tableA', name: 'Table A', source: mockDataSourceB.name, isFact: true }),
        //@ts-expect-error
        TableFactory.create({ id: 'tableB', name: 'Table B', source: mockDataSourceB.name, isFact: true }),
        //@ts-expect-error
        TableFactory.create({ id: 'notFactTable', source: mockDataSourceB.name, isFact: false }),
      ],
      mockDataSourceB.name
    );

    assert.deepEqual(
      MetadataService.all('table', mockDataSourceB.name).map((t) => t.id),
      ['tableA', 'tableB', 'notFactTable'],
      'The tables are loaded correctly into the metadata'
    );

    await render(TEMPLATE);

    assert.dom('.report-builder__main').isVisible('Report builder renders');

    assert.deepEqual(
      findAll('.report-builder-sidebar__breadcrumb-item').map((el) => el.textContent?.trim()),
      ['Data Sources'],
      'The breadcrumb links back to data sources'
    );
    assert.dom('.report-builder-sidebar__source').hasText('Source B', 'Source B is selected');

    assert.deepEqual(
      findAll('.report-builder-source-selector--tables .report-builder-source-selector__source-name').map((el) =>
        el.textContent?.trim()
      ),
      ['Table A', 'Table B'],
      'Both fact tables are shown'
    );

    await click('.report-builder-sidebar__breadcrumb-item[data-level="0"]');
    await animationsSettled();
    assert.deepEqual(
      findAll('.report-builder-source-selector--datasources .report-builder-source-selector__source-name').map((el) =>
        el.textContent?.trim()
      ),
      ['Source B'],
      'The only data source is shown'
    );
    config.navi.dataSources = originalDataSources;
  });

  test('Multiple datasources nothing is automatically selected', async function (assert) {
    assert.expect(4);

    const originalDataSources = config.navi.dataSources;
    config.navi.dataSources = [mockDataSourceA, mockDataSourceB];

    //reset meta data and load only one table
    MetadataService['keg'].resetByType('metadata/table');
    MetadataService['loadMetadataForType'](
      'table',
      [
        //@ts-expect-error
        TableFactory.create({ id: 'tableA', name: 'Table A', source: mockDataSourceA.name, isFact: true }),
        //@ts-expect-error
        TableFactory.create({ id: 'notFactTable', source: mockDataSourceA.name, isFact: false }),
      ],
      mockDataSourceA.name
    );
    MetadataService['loadMetadataForType'](
      'table',
      [
        //@ts-expect-error
        TableFactory.create({ id: 'tableA', name: 'Table A', source: mockDataSourceB.name, isFact: true }),
        //@ts-expect-error
        TableFactory.create({ id: 'tableB', name: 'Table B', source: mockDataSourceB.name, isFact: true }),
      ],
      mockDataSourceB.name
    );

    await render(TEMPLATE);

    assert.dom('.report-builder__main').isVisible('Report builder renders');

    assert.deepEqual(
      findAll('.report-builder-sidebar__breadcrumb-item').map((el) => el.textContent?.trim()),
      ['Select A Datasource'],
      'The breadcrumb links back to data sources'
    );
    assert.dom('.report-builder-sidebar__source').hasText('Data Sources', 'The DataSources are listed');

    assert.deepEqual(
      findAll('.report-builder-source-selector__source-name').map((el) => el.textContent?.trim()),
      ['Source A', 'Source B'],
      'Both fact tables are shown'
    );
    config.navi.dataSources = originalDataSources;
  });

  test('Open and close sidebar', async function (assert) {
    await render(TEMPLATE);

    const openToggle = '.report-builder__sidebar-open';
    assert.dom(openToggle).doesNotExist('The open toggle is not visible');
    assert.dom('.report-builder-sidebar__header').exists('The sidebar is visible');

    await click('.report-builder-sidebar__close');
    await animationsSettled();

    assert.dom('.report-builder-sidebar__header').doesNotExist('The sidebar is closed');
    assert.dom(openToggle).exists('The open toggle is visible when sidebar is closed');

    await click(openToggle);
    await animationsSettled();
    assert.dom('.report-builder-sidebar__header').exists('The sidebar is open again');
  });
});
