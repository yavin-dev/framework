import Base from 'navi-reports/components/filter-builders/base';

export default class FilterBuildersTest extends Base {
  get supportedOperators() {
    return [
      { id: 'in' as const, name: 'Equals', valuesComponent: 'filter-values/test-one' },
      { id: 'notin' as const, name: 'Not Equals', valuesComponent: 'filter-values/test-one' },
      { id: 'null' as const, name: 'Is Empty', valuesComponent: 'filter-values/test-two' }
    ];
  }
}
