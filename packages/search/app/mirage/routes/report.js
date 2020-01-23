import Mirage from 'ember-cli-mirage';
import moment from 'moment';
import RESPONSE_CODES from '../enums/response-codes';
const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export default function() {
  /**
   * reports/ - GET endpoint to fetch many reports
   */
  this.get('/reports', function({ reports }, request) {
    let idFilter = request.queryParams['filter[reports.id]'];
    let reportsObject = null;

    // Allow filtering
    if (idFilter) {
      let ids = idFilter.split(',');
      reportsObject = reports.find(ids);
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
