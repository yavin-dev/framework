import NaviBaseSearchProviderService from './navi-base-search-provider';

export default class NaviReportSearchProviderService extends NaviBaseSearchProviderService {
  /**
   * @property name
   * @override
   */
  name = 'reportSearchProvider';

  /**
   * @property niceName
   * @override
   */
  niceName = 'Report Search Provder';

  /**
   * @property associatedComponent
   */
  associatedComponent = 'navi-report-search-result';

  /**
   * @method search
   * @override
   * @param {Object} searchParams
   * @param {Object} author
   * @returns {Promise} promise
   */
  search(searchParams, author) {
    let query = { filter: { reports: '' } };

    for (let p in searchParams) {
      let filter = `${p}==*${searchParams[p]}*`;
      if (query.filter.reports) {
        query.filter.reports += `,${filter}`;
      } else {
        query.filter.reports = `(${filter}`;
      }
    }
    query.filter.reports += ')';

    if (author) {
      query.filter.reports += `;author==*${author}*`;
    }

    return this.store.query('report', query);
  }
}
