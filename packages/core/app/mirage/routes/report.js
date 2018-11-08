import Mirage from 'ember-cli-mirage';
import moment from 'moment';
const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const RESPONSE_CODES = {
  NOT_FOUND: 404,
  CREATED: 201,
  LOCKED: 423,
  NO_CONTENT: 204,
  UNPROCESSABLE_ENTITY: 422
};

export default function() {
  /**
   * reports/ - GET endpoint to fetch many reports
   */
  this.get('/reports', function({ reports }, request) {
    // debugger;
    // let idFilter = request.queryParams['filter[reports.id]'],
    //   reports = db.reports;

    // // Allow filtering
    // if (idFilter) {
    //   let ids = idFilter.split(',');

    //   reports = db.reports.find(ids);
    // }

    // return jsonToJsonApi(reports, 'reports', );

    let idFilter = request.queryParams['filter[reports.id]'];

    // Allow filtering
    if (idFilter) {
      let ids = idFilter.split(',');
      reports = reports.find(ids);
    } else {
      reports = reports.all();
    }

    debugger;
    return reports;
  });

  /**
   * reports/:id - GET endpoint to fetch a report by id
   */
  this.get('/reports/:id', function({ reports }, request) {
    // let id = request.params.id,
    //   report = db.reports.find(id);

    // if (!report) {
    //   return new Mirage.Response(RESPONSE_CODES.NOT_FOUND, {}, { errors: [`Unknown identifier '${id}'`] });
    // }

    // debugger;
    // return jsonToJsonApi(report, 'reports',);

    let id = request.params.id,
      report = reports.find(id);

    debugger;
    return report;
  });

  /**
   * reports/ -  POST endpoint to add a new report
   */
  // this.post('/reports', function({ reports, db }) {
  // let postData = JSON.parse(request.requestBody),
  //   userId = postData.data.relationships.author.data.id,
  //   user = db.users.find(userId);

  // // Add report only if user exists
  // if (!user) {
  //   return new Mirage.Response(RESPONSE_CODES.NOT_FOUND, {}, { errors: [`Unknown identifier '${userId}'`] });
  // }

  // let report = jsonApiToJson(postData);
  // report.createdOn = moment.utc().format(TIMESTAMP_FORMAT);
  // report.updatedOn = moment.utc().format(TIMESTAMP_FORMAT);

  // let createdReport = db.reports.insert(report);

  // //update user with new created report
  // user.reports = user.reports.concat([Number(createdReport.id)]);
  // delete user.id;
  // db.users.update(userId, user);

  // return new Mirage.Response(
  //   RESPONSE_CODES.CREATED,
  //   {},
  //   jsonToJsonApi(createdReport, 'reports')
  // );

  this.post('/reports', function({ reports, db }) {
    let attrs = this.normalizedRequestAttrs(),
      report = reports.create(attrs);
    debugger;

    // // Update user with new report
    // db.users.update(report.authorId, {
    //   reports: report.author.reports.concat([Number(report.id)])
    // });

    // Init properties
    db.reports.update(report.id, {
      widgetIds: [],
      createdOn: moment.utc().format(TIMESTAMP_FORMAT),
      updatedOn: moment.utc().format(TIMESTAMP_FORMAT)
    });

    return report;
  });

  /**
   * reports/:id -  PATCH endpoint to an existing report
   */
  this.patch('/reports/:id', function({ reports }, request) {
    // let postData = JSON.parse(request.requestBody),
    //   userId = postData.data.relationships.author.data.id,
    //   user = db.users.find(userId);

    // // Add report only if user exists
    // if (!user) {
    //   return new Mirage.Response(RESPONSE_CODES.NOT_FOUND, {}, { errors: [`Unknown identifier '${userId}'`] });
    // }

    // let report = jsonApiToJson(postData),
    //   reportId = Number(report.id);

    // report.updatedOn = moment.utc().format(TIMESTAMP_FORMAT);
    // delete report.id;
    // db.reports.update(reportId, report);

    // return new Mirage.Response(RESPONSE_CODES.NO_CONTENT);

    let { id } = request.params,
      attrs = this.normalizedRequestAttrs();

    reports.find(id).update(attrs);
    return new Mirage.Response(RESPONSE_CODES.NO_CONTENT);
  });

  /**
   * reports/:id -  DELETE endpoint to delete a report by id
   */
  this.delete('/reports/:id', function({ reports, db }, request) {
    // let id = request.params.id,
    //   report = db.reports.find(id);

    // if (!report) {
    //   return new Mirage.Response(RESPONSE_CODES.NOT_FOUND, {}, { errors: [`Unknown identifier '${id}'`] });
    // }

    // // delete record
    // db['reports'].remove(id);

    // return new Mirage.Response(RESPONSE_CODES.NO_CONTENT);

    let { id } = request.params,
      report = reports.find(id),
      user = db.users.find(report.authorId);

    if (!report) {
      return new Mirage.Response(RESPONSE_CODES.NOT_FOUND, {}, { errors: [`Unknown identifier '${id}'`] });
    }

    // Delete report from user
    db.users.update(report.authorId, {
      reports: user.reports.filter(id => id.toString() !== report.id)
    });

    report.destroy();

    return new Mirage.Response(RESPONSE_CODES.NO_CONTENT);
  });
}
