import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import moment, { Moment } from 'moment';

export default class DatePickController extends Controller {
  @tracked savedDate = moment.utc('2021-08-03');

  @action
  onUpdate(date: Moment) {
    this.savedDate = moment.utc(date);
  }
}
