import Base, { FilterValueBuilder } from 'navi-reports/components/filter-builders/base';

export default class FilterBuildersTest extends Base {
  get valueBuilders(): FilterValueBuilder[] {
    return [
      { operator: 'in' as const, name: 'Equals', component: 'filter-values/test-one' },
      { operator: 'notin' as const, name: 'Not Equals', component: 'filter-values/test-one' },
      { operator: 'isnull' as const, name: 'Is Empty', component: 'filter-values/test-two', defaultValues: [true] }
    ];
  }
}
