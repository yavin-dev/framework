import Mirage from 'ember-cli-mirage';
import moment from 'moment';
import RESPONSE_CODES from '../enums/response-codes';
import { sort } from '@ember/object/computed';

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

function sortModel(querystatsModel, property) {
  let sortOrder = property['dir'] == 'asc' ? 1 : -1;
  let sortColumn = property['sort'];

  return function(a, b) {
    if (sortOrder == -1) {
      if (typeof b[sortColumn] === 'string') {
        return b[sortColumn].localeCompare(a[sortColumn]);
      } else {
        if (b[sortColumn] > a[sortColumn]) {
          return 1;
        } else if (b[sortColumn] < a[sortColumn]) {
          return -1;
        }
        return 0;
      }
    } else {
      if (typeof a[sortColumn] === 'string') {
        return a[sortColumn].localeCompare(b[sortColumn]);
      } else {
        if (a[sortColumn] > b[sortColumn]) {
          return 1;
        } else if (a[sortColumn] < b[sortColumn]) {
          return -1;
        }
        return 0;
      }
    }
  };
}

//put it inside core/app/mirage/routes
//only the get
export default function() {
  // this.get('/admin/querystats', function({ querystats }) {
  //   return ['A', 'B', 'C'];
  // });
  //console.log('Reached here!!!!!!');
  //this.namespace = 'admin' GET /querystats
  this.get('/querystats', function({ querystats }, request) {
    //let idFilter = request.queryParams['filter[querystats.createdOn]'];
    console.log('GET Gets Called');
    // Allow filtering
    //filer based on current date
    //can get it out from DateTime or request_Queryparams

    //get current date
    let today = new Date();
    let currentDate = today.getDate();
    let currentMonth = today.getMonth() + 1; //Month starts from 0
    let currentYear = today.getFullYear();
    let date = currentDate + '/' + currentMonth + '/' + currentYear;
    console.log(date);

    querystats = querystats.all();
    let querystatsModel = querystats.models;
    let property = {};
    if (Object.keys(request.queryParams).length !== 0) {
      property['sort'] = request.queryParams.sort;
      property['dir'] = request.queryParams.dir;
    } else {
      property['sort'] = 'createdOn';
      property['dir'] = 'desc';
    }

    querystatsModel.sort(sortModel(querystatsModel, property));
    // if (idFilter) {
    //   let ids = idFilter.split(',');
    //   querystats = querystats.find(ids);
    // } else {
    //   querystats = querystats.all();
    // }
    querystats.models = querystatsModel;
    console.log(querystats);
    return querystats;
  });

  this.get('/querystats/:id');

  //no need for post
  this.post('/querystats', function({ querystats, db }) {
    let attrs = this.normalizedRequestAttrs(),
      querystat = querystats.create(attrs);

    // Init properties
    db.querystats.update(querystat.id, {
      createdOn: moment.utc().format(TIMESTAMP_FORMAT),
      updatedOn: moment.utc().format(TIMESTAMP_FORMAT)
    });

    return querystat;
  });
}
