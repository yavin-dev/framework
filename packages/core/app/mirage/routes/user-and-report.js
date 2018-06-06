import Mirage from 'ember-cli-mirage';
import Ember from 'ember';
import moment from 'moment';
import { jsonToJsonApi, jsonApiToJson } from './helpers';

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/**
 * Schema for jsonApi relationships
 *
 * TODO: use relationships from report model
 */
const RELATIONSHIP_MAP = {
  reports: Ember.A([
    {
      property: 'author',
      type: 'users',
      relation: 'hasOne'
    },
    {
      property: 'deliveryRules',
      type: 'deliveryRules',
      relation: 'hasMany',
      alias: 'deliveredItemId'
    }
  ]),
  users: Ember.A([
    {
      property: 'reports',
      type: 'reports',
      relation: 'hasMany'
    },
    {
      property: 'favoriteReports',
      type: 'reports',
      relation: 'hasMany'
    },
    {
      property: 'deliveryRules',
      type: 'deliveryRules',
      relation: 'hasMany'
    }
  ])
};

const RELATIONSHIP_BUILDER = {
  /**
   * Register a relationship with the mock user endpoint
   * @method withUserRelationship
   * @param {Object} relationship
   * @param {String} relationship.property - field name of relationship in user model
   * @param {String} relationship.type - model name for relationship
   * @param {String} relationship.relation - 'hasMany' || 'hasOne'
   */
  withUserRelationship(relationship) {
    RELATIONSHIP_MAP.users.push(relationship);

    return this;
  }
};

const RESPONSE_CODES  = {
  NOT_FOUND: 404,
  CREATED: 201,
  LOCKED: 423,
  NO_CONTENT: 204,
  UNPROCESSABLE_ENTITY: 422
};

export default function() {
  /**
   * users/:id - GET endpoint to fetch user by id
   */
  this.get('/users/:id', ({ db }, request) => {

    let id = request.params.id,
        user = db.users.find(id);

    if (!user) {
      return new Mirage.Response(
        RESPONSE_CODES.NOT_FOUND,
        {},
        {errors:[`Unknown identifier '${id}'`]}
      );
    }

    let include = request.queryParams.include,
        includeObj;
    if(include) {
      includeObj = {
        data: db[include].where({author: id}),
        type: include
      };
    }

    return jsonToJsonApi(user, 'users', RELATIONSHIP_MAP.users, includeObj);
  });

  /**
   * users/ - GET endpoint to fetch many users
   */
  this.get('/users', ({ db }, request) => {

    let idFilter = request.queryParams['filter[users.id]'],
        users = db.users;

        // Allow filtering
    if (idFilter) {
      let ids = idFilter.split(',');
      users = db.users.find(ids);
    }

    return jsonToJsonApi(users, 'users', RELATIONSHIP_MAP.users);
  });

  /**
   * users/ -  POST endpoint to add a new user
   */
  this.post('/users', ({ db }, request) => {

    let postData = JSON.parse(request.requestBody),
        userId = postData.data.id;

        // Add user only if it does not exists
    if (db.users.find(userId)) {
      return new Mirage.Response(RESPONSE_CODES.LOCKED);
    } else {
      let user = jsonApiToJson(postData);

      Object.assign(user,
        { createdOn: moment.utc().format(TIMESTAMP_FORMAT) },
        ...RELATIONSHIP_MAP.users.map(relationship => {
          return { [relationship.property]: [] };
        })
      ); // add createdOn and reports property

      db.users.insert(user);
      return new Mirage.Response(RESPONSE_CODES.CREATED, {}, postData);
    }
  });

  /**
   * users/:id -  PATCH endpoint for an existing user
   */
  this.patch('/users/:id', ({ db }, request) => {

    let patchData = JSON.parse(request.requestBody),
        userId = patchData.data.id;

        // Update only if user exists
    if (!db.users.find(userId)) {
      return new Mirage.Response(
        RESPONSE_CODES.NOT_FOUND,
        {},
        {errors:[`Unknown identifier '${userId}'`]}
      );
    }

    let user = jsonApiToJson(patchData, RELATIONSHIP_MAP.users);
    user.updatedOn = moment.utc().format(TIMESTAMP_FORMAT);
    db.users.update(user.id, user);

    return new Mirage.Response(RESPONSE_CODES.NO_CONTENT);
  });

  /**
   * reports/ - GET endpoint to fetch many reports
   */
  this.get('/reports', ({ db }, request) => {

    let idFilter = request.queryParams['filter[reports.id]'],
        reports = db.reports;

        // Allow filtering
    if (idFilter) {
      let ids = idFilter.split(',');

      reports = db.reports.find(ids);
    }

    return jsonToJsonApi(reports, 'reports', RELATIONSHIP_MAP.reports);
  });

  /**
   * reports/:id - GET endpoint to fetch a report by id
   */
  this.get('/reports/:id', ({ db }, request) => {
    let id = request.params.id,
        report = db.reports.find(id);

    if (!report) {
      return new Mirage.Response(
        RESPONSE_CODES.NOT_FOUND,
        {},
        {errors:[`Unknown identifier '${id}'`]}
      );
    }

    return jsonToJsonApi(report, 'reports', RELATIONSHIP_MAP.reports);
  });

  /**
   * reports/ -  POST endpoint to add a new report
   */
  this.post('/reports', ({ db }, request) => {

    let postData = JSON.parse(request.requestBody),
        userId = postData.data.relationships.author.data.id,
        user = db.users.find(userId);

        // Add report only if user exists
    if (!user) {
      return new Mirage.Response(
        RESPONSE_CODES.NOT_FOUND,
        {},
        {errors:[`Unknown identifier '${userId}'`]}
      );
    }

    let report = jsonApiToJson(postData, RELATIONSHIP_MAP.reports);
    report.createdOn = moment.utc().format(TIMESTAMP_FORMAT);
    report.updatedOn = moment.utc().format(TIMESTAMP_FORMAT);

    let createdReport = db.reports.insert(report);

    //update user with new created report
    user.reports = user.reports.concat([Number(createdReport.id)]);
    delete user.id;
    db.users.update(userId, user);

    return new Mirage.Response(RESPONSE_CODES.CREATED, {}, jsonToJsonApi(createdReport, 'reports', RELATIONSHIP_MAP.reports));
  });

  /**
   * reports/:id -  PATCH endpoint to an existing report
   */
  this.patch('/reports/:id', ({ db }, request) => {

    let postData = JSON.parse(request.requestBody),
        userId = postData.data.relationships.author.data.id,
        user = db.users.find(userId);

        // Add report only if user exists
    if (!user) {
      return new Mirage.Response(
        RESPONSE_CODES.NOT_FOUND,
        {},
        {errors:[`Unknown identifier '${userId}'`]}
      );
    }

    let report = jsonApiToJson(postData, RELATIONSHIP_MAP.reports),
        reportId = Number(report.id);

    report.updatedOn = moment.utc().format(TIMESTAMP_FORMAT);
    delete report.id;
    db.reports.update(reportId, report);

    return new Mirage.Response(RESPONSE_CODES.NO_CONTENT);
  });

  /**
   * reports/:id -  DELETE endpoint to delete a report by id
   */
  this.delete('/reports/:id', ({ db }, request) => {
    let id = request.params.id,
        report = db.reports.find(id);

    if (!report) {
      return new Mirage.Response(
        RESPONSE_CODES.NOT_FOUND,
        {},
        {errors:[`Unknown identifier '${id}'`]}
      );
    }

    deleteRecord(db, 'reports', id);

    return new Mirage.Response(RESPONSE_CODES.NO_CONTENT);
  });

  return RELATIONSHIP_BUILDER;
}

/**
 * Deletes a record
 *
 * @param {Object} db - Mirage DB instance
 * @param {String} type - type of record to be deleted
 * @param {String/Number} id - id of record to be deleted
 * @returns {Void}
 */
function deleteRecord(db, type, id){
  // delete record
  db[type].remove(id);

  // delete reference of record
  RELATIONSHIP_MAP[type].forEach(relationship => {
    let relType = relationship.type,
        alias = relationship.alias;

    db[relType].forEach(record => {
      let typeIds = record[alias] || record[type],
          updatedIds = typeIds;

      if (Ember.isArray(typeIds)) {//handle case when typeIds is an array
        updatedIds = typeIds.filter(typeId => {
          return typeId.toString() !== id;
        });
      } else if (typeIds.toString() === id) { //handle case when typeIds is number/string
        updatedIds = undefined;
      }

      db[relType].update(record.id, { [type]: updatedIds });
    });
  });
}
