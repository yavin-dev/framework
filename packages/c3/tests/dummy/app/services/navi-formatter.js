import NaviFormatterService from 'navi-data/services/navi-formatter';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { action } from '@ember/object';
import { assert } from '@ember/debug';
import numbro from 'numbro';
import ColumnFragment from 'navi-core/models/request/column';

export default class CustomFormatterService extends NaviFormatterService {
  @service router;

  @action
  formatMetricValue(value, column, row, requestedFormat) {
    if (this.router.currentRouteName !== 'line-chart') {
      return super.formatMetricValue(...arguments);
    }
    if (isEmpty(value)) {
      return '--';
    }
    const format = requestedFormat ? requestedFormat : { mantissa: 9, trimMantissa: true, thousandSeparated: true };
    assert('The column is passed', column instanceof ColumnFragment);
    assert('The row is passed', typeof row === 'object');
    assert('The correct value is passed', row[column.canonicalName] === value);
    return numbro(value).format(format) + ` rc=${Object.keys(row).length}`;
  }
}
