import Base from 'navi-reports/components/filter-builders/base';

export default class FilterBuildersTest extends Base {
  supportedOperators = [
    { id: 'in', name: 'Equals', valuesComponent: 'filter-values/test-one' },
    { id: 'notin', name: 'Not Equals', valuesComponent: 'filter-values/test-one' },
    { id: 'null', name: 'Is Empty', valuesComponent: 'filter-values/test-two' }
  ];
}
