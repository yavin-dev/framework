import Mirage from 'ember-cli-mirage';
import moment from 'moment';
import RESPONSE_CODES from '../enums/response-codes';
import { getFilterParams, getQueryAuthor } from 'navi-core/utils/rsql-utils';
const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

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
        const matchesFilterParameterIfExists = !!filterParameters
          ? filterParameters.every(filterParameter =>
              JSON.stringify(report[filterParameter[0]]).match(new RegExp(filterParameter[1], 'i'))
            )
          : true;
        const matchesAuthorIfExists = !!author ? !!report.author.id.match(new RegExp(author, 'i')) : true;
        return matchesFilterParameterIfExists && matchesAuthorIfExists;
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
