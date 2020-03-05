import Component from '@glimmer/component';
import { pluralize } from 'ember-inflector';

export default class NaviAssetSearchResultComponent extends Component {
  /**
   * @property {Array} results
   */
  get results() {
    return this.args?.data?.map(value => {
      value.route = this._extractRoute(value);
      return value;
    });
  }

  /**
   * @method _extractRoute – Extracts the route name of a given asset (report or dashboard)
   * @private
   * @param {Object} asset
   * @returns {String} Route
   */
  _extractRoute(asset) {
    const type = asset?.constructor?.modelName,
      pluralType = pluralize(type);
    return `${pluralType}.${type}`;
  }
}
