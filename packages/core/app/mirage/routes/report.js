import Mirage from 'ember-cli-mirage';
import moment from 'moment';
import RESPONSE_CODES from '../enums/response-codes';
const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/**
 * @method getFilterParams
 * @param {String} queryFilter
 * @returns {Array} Filter parameters
 * @description Parse filter parameters in the form of "(title==*H*,request==*Revenue*)";author==*ramvish*
 * to a list of all the OR parameters, ie., [H, Revenue]
 */
const getFilterParams = function(queryFilter) {
  return queryFilter
    .split(';')[0]
    .replace(/\(/g, '')
    .replace(/\)/g, '')
    .replace(/\*/g, '')
    .split(',')
    .map(el => el.split('==')[1]);
};

/**
 * @method getQueryAuthor
 * @param {String} queryFilter
 * @returns Author
 * @description Parse filter parameters in the form of "(title==*H*,request==*Revenue*)";author==*ramvish*
 * to get the author, ie., ramvish
 */
const getQueryAuthor = function(queryFilter) {
  if (queryFilter.includes('author')) {
    return queryFilter
      .split(';')[1]
      .replace(/\*/g, '')
      .split('==')[1];
  }
  return null;
};

export default function() {
  /**
   * reports/ - GET endpoint to fetch many reports
   */
  this.get('/reports', function({ reports }, request) {
    let reportsObject;
    let idFilter = request.queryParams['filter[reports.id]'];
    let queryFilter = request.queryParams['filter[reports]'];

    // Allow filtering
    if (idFilter) {
      let ids = idFilter.split(',');
      reportsObject = reports.find(ids);
    } else if (queryFilter) {
      let filterParameters = getFilterParams(queryFilter);
      let author = getQueryAuthor(queryFilter);
      reportsObject = reports.all().filter(function(report) {
        // Return all reports that include the filter parameters and are written by the specified author (if exists)
        const matchesFilterParameter = filterParameters.every(filterParameter =>
          JSON.stringify(report).match(new RegExp(filterParameter, 'i'))
        );
        const mathesAuthorIfExists = author != null ? report.author.id.match(new RegExp(author, 'i')) : true;
        return matchesFilterParameter && mathesAuthorIfExists;
      });
    } else {
      reportsObject = reports.all();
    }

    return reportsObject;
  });

  /**
   * reports/:id - GET endpoint to fetch a report by id
   */
  this.get('/reports/:id');

  /**
   * reports/ -  POST endpoint to add a new report
   */
  this.post('/reports', function({ reports, db }) {
    let attrs = this.normalizedRequestAttrs(),
      report = reports.create(attrs);

    // Init properties
    db.reports.update(report.id, {
      createdOn: moment.utc().format(TIMESTAMP_FORMAT),
      updatedOn: moment.utc().format(TIMESTAMP_FORMAT)
    });

    return report;
  });

  /**
   * reports/:id -  PATCH endpoint to an existing report
   */
  this.patch('/reports/:id');

  /**
   * reports/:id -  DELETE endpoint to delete a report by id
   */
  this.del('/reports/:id', function({ reports, users }, request) {
    let { id } = request.params,
      report = reports.find(id),
      user = users.find(report.authorId);

    if (!report) {
      return new Mirage.Response(RESPONSE_CODES.NOT_FOUND, {}, { errors: [`Unknown identifier '${id}'`] });
    }

    // Delete report from user
    user.update({
      reports: user.reports.filter(id => id.toString() !== report.id)
    });
    report.destroy();

    return new Mirage.Response(RESPONSE_CODES.NO_CONTENT);
  });
}
