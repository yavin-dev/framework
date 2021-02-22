import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { helper } from '@ember/component/helper';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import TableMetadataModel from 'navi-data/models/metadata/table';

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

  test("Single table in meta shouldn't show table selector", async function (assert) {
    assert.expect(2);
    //reset meta data and load only one table
    MetadataService.keg.resetByType('metadata/table');
    MetadataService.loadMetadataForType(
      'table',
      [
        TableMetadataModel.create({
          id: 'tableA',
          name: 'Table A',
          description: 'Table A',
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
    assert.dom('.navi-table-select').isNotVisible('Table selector does not render with only one table');
  });

  test('Multiple tables in meta should show table selector', async function (assert) {
    assert.expect(1);

    await render(TEMPLATE);

    assert.dom('.navi-table-select__trigger').isVisible('Table renders when there are multiple tables');
  });
});
