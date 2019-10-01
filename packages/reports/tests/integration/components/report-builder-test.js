import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { helper } from '@ember/component/helper';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

let MetadataService, Store;

module('Integration | Component | report builder', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    MetadataService = this.owner.lookup('service:bard-metadata');
    Store = this.owner.lookup('service:store');

    this.owner.__container__.registry.registrations['helper:update-report-action'] = helper(() => () => {});

    return MetadataService.loadMetadata().then(() => {
      this.set(
        'report',
        Store.createRecord('report', {
          request: Store.createFragment('bard-request/request', {
            logicalTable: Store.createFragment('bard-request/fragments/logicalTable', {
              table: MetadataService.getById('table', 'tableA'),
              timeGrainName: 'day'
            })
          }),
          visualization: {}
        })
      );
    });
  });

  test("Single table in meta shouldn't show table selector", async function(assert) {
    assert.expect(2);
    //reset meta data and load only one table
    MetadataService.get('_keg').resetByType('metadata/table');
    MetadataService._loadMetadataForType('table', [
      {
        name: 'tableA',
        longName: 'Table A',
        description: 'Table A'
      }
    ]);

    await render(hbs`{{report-builder
      report=report
    }}`);

    assert.dom('.report-builder__main').isVisible('Report builder renders');
    assert.dom('.navi-table-select').isNotVisible('Table selector does not render with only one table');
  });

  test('Multiple tables in meta should show table selector', async function(assert) {
    assert.expect(1);

    await render(hbs`{{report-builder
      report=report
    }}`);

    assert.dom('.navi-table-select').isVisible('Table renders when there are multiple tables');
  });
});
