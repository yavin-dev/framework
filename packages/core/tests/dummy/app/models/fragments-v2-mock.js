import Model from '@ember-data/model';
import { fragment, fragmentArray } from 'ember-data-model-fragments/attributes';

export default class FragmentsV2MockModel extends Model {
  @fragmentArray('bard-request-v2/fragments/filter') filters;
  @fragmentArray('bard-request-v2/fragments/column') columns;
  @fragmentArray('bard-request-v2/fragments/sort') sort;
  @fragment('bard-request-v2/request') request;
}
