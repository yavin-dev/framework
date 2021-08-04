import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Moment from 'moment';

export default class DatePickController extends Controller {
  @tracked savedDate = Moment.utc('2021-08-03');

  @action
  onUpdate(date) {
    this.savedDate = Moment.utc(date);
  }
}
