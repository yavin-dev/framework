import { moduleForComponent, test } from 'ember-qunit';
import { getOwner } from '@ember/application';
import  { helper } from '@ember/component/helper';
import hbs from 'htmlbars-inline-precompile';
import {
  setupMock,
  teardownMock
} from '../../helpers/mirage-helper';

let MetadataService, Store;

moduleForComponent('report-builder', 'Integration | Component | report builder', {
  integration: true,

  beforeEach() {
    setupMock();
    MetadataService = getOwner(this).lookup('service:bard-metadata');
    Store = getOwner(this).lookup('service:store');

    this.container
      .registry
      .registrations['helper:update-report-action'] = helper(() => () => {});

    return MetadataService.loadMetadata().then(() => {
      this.set('report', Store.createRecord('report', {
        request: Store.createFragment('bard-request/request', {
          logicalTable: Store.createFragment('bard-request/fragments/logicalTable', {
            table: MetadataService.getById('table', 'tableA'),
            timeGrainName: 'day'
          })
        }),
        visualization: {}
      }));
    });
  },

  afterEach() {
    teardownMock();
  }
});

test('Single table in meta shouldn\'t show table selector', function(assert) {
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

  this.render(hbs`{{report-builder
    report=report
  }}`);

  assert.ok(this.$('.report-builder__main').is(':visible'),
    'Report builder renders');
  assert.notOk(this.$('.navi-table-select').is(':visible'),
    'Table selector does not render with only one table');
});

test('Multiple tables in meta should show table selector', function(assert) {
  assert.expect(1);

  this.render(hbs`{{report-builder
    report=report
  }}`);

  assert.ok(this.$('.navi-table-select').is(':visible'),
    'Table renders when there are multiple tables');
});
