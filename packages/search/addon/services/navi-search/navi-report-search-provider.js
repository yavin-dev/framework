import NaviBaseSearchProviderService from './navi-base-search-provider';

export default class NaviReportSearchProviderService extends NaviBaseSearchProviderService {
  /**
   * @property name
   */
  name = 'reportSearchProvider';

  /**
   * @property niceName
   */
  niceName = 'Report Search Provder';

  /**
   * @property associatedComponent
   */
  associatedComponent = 'navi-report-search-result';

  /**
   * @method search
   * @param {String} query
   * @param {String} user (optional)
   * @returns {Promise} promise
   */
  search(params) {
    let query = { filter: { reports: '' } };

    for (let p in params) {
      let filter = `${p}==*${params[p]}*`;
      if (query.filter.reports) {
        query.filter.reports += `;${filter}`;
      } else {
        query.filter.reports = `${filter}`;
      }
    }

    return this.store.query('report', query);
  }
}
