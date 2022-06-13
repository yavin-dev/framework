import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll } from '@ember/test-helpers';
import { helper } from '@ember/component/helper';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import TableMetadataModel from '@yavin/client/models/metadata/table';
//@ts-ignore
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type StoreService from '@ember-data/store';
import type YavinClientService from 'navi-data/services/yavin-client';

const mockDataSourceA = <const>{
  name: 'bardOne',
  displayName: 'Source A',
  description: 'Awesome Source A',
  uri: 'https://data.naviapp.io',
  type: 'bard',
};
const mockDataSourceB = <const>{
  name: 'bardTwo',
  displayName: 'Source B',
  description: 'Beautiful Source B',
  uri: 'https://data2.naviapp.io',
  type: 'bard',
};

let MetadataService: NaviMetadataService;
let YavinClient: YavinClientService;
let Store: StoreService;

const TEMPLATE = hbs`<ReportBuilder @report={{this.report}} />`;
module('Integration | Component | report builder', function (hooks) {
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    YavinClient = this.owner.lookup('service:yavin-client');
    MetadataService = this.owner.lookup('service:navi-metadata');
    Store = this.owner.lookup('service:store');

    this.owner.register(
      'helper:update-report-action',
      helper(() => () => undefined)
    );

    await MetadataService.loadMetadata({ dataSourceName: mockDataSourceA.name });
    await MetadataService.loadMetadata({ dataSourceName: mockDataSourceB.name });
    this.set(
      'report',
      Store.createRecord('report', {
        request: Store.createFragment('request', {
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
    YavinClient.clientConfig.dataSources = [mockDataSourceA];
    MetadataService['loadedDataSources'].add(mockDataSourceA.name);

    //reset meta data and load only one table
    MetadataService['keg'].resetByType('metadata/table');
    MetadataService['loadMetadataForType'](
      'table',
      [
        //@ts-expect-error
        new TableMetadataModel(this.owner.lookup('service:client-injector'), {
          id: 'tableA',
          name: 'Table A',
          source: mockDataSourceA.name,
          isFact: true,
        }),
        //@ts-expect-error
        new TableMetadataModel(this.owner.lookup('service:client-injector'), {
          id: 'notFactTable',
          source: mockDataSourceA.name,
          isFact: false,
        }),
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
  });

  test('Single datasource with multiple tables only selects datasource', async function (assert) {
    assert.expect(6);

    YavinClient.clientConfig.dataSources = [mockDataSourceB];
    MetadataService['loadedDataSources'].add(mockDataSourceB.name);

    //reset meta data and load only one table
    MetadataService['keg'].resetByType('metadata/table');
    MetadataService['loadMetadataForType'](
      'table',
      [
        //@ts-expect-error
        new TableMetadataModel(this.owner.lookup('service:client-injector'), {
          id: 'tableA',
          name: 'Table A',
          source: mockDataSourceB.name,
          isFact: true,
        }),
        //@ts-expect-error
        new TableMetadataModel(this.owner.lookup('service:client-injector'), {
          id: 'tableB',
          name: 'Table B',
          source: mockDataSourceB.name,
          isFact: true,
        }),
        //@ts-expect-error
        new TableMetadataModel(this.owner.lookup('service:client-injector'), {
          id: 'notFactTable',
          source: mockDataSourceB.name,
          isFact: false,
        }),
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
  });

  test('Multiple datasources nothing is automatically selected', async function (assert) {
    assert.expect(4);

    YavinClient.clientConfig.dataSources = [mockDataSourceA, mockDataSourceB];

    //reset meta data and load only one table
    MetadataService['keg'].resetByType('metadata/table');
    MetadataService['loadMetadataForType'](
      'table',
      [
        //@ts-expect-error
        new TableMetadataModel(this.owner.lookup('service:client-injector'), {
          id: 'tableA',
          name: 'Table A',
          source: mockDataSourceA.name,
          isFact: true,
        }),
        //@ts-expect-error
        new TableMetadataModel(this.owner.lookup('service:client-injector'), {
          id: 'notFactTable',
          source: mockDataSourceA.name,
          isFact: false,
        }),
      ],
      mockDataSourceA.name
    );
    MetadataService['loadMetadataForType'](
      'table',
      [
        //@ts-expect-error
        new TableMetadataModel(this.owner.lookup('service:client-injector'), {
          id: 'tableA',
          name: 'Table A',
          source: mockDataSourceB.name,
          isFact: true,
        }),
        //@ts-expect-error
        new TableMetadataModel(this.owner.lookup('service:client-injector'), {
          id: 'tableB',
          name: 'Table B',
          source: mockDataSourceB.name,
          isFact: true,
        }),
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
