import Model from '@ember-data/model';
import { fragment, fragmentArray } from 'ember-data-model-fragments/attributes';
import attr from 'ember-data/attr';

export default class FragmentsV2MockModel extends Model {
  @fragmentArray('bard-request-v2/fragments/filter') filters;
  @fragmentArray('bard-request-v2/fragments/column') columns;
  @fragmentArray('bard-request-v2/fragments/sort') sorts;
  @fragment('bard-request-v2/request') request;
  @attr('string', { defaultValue: 'bardOne' }) dataSource;
}
