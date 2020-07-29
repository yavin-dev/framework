import Mirage from 'ember-cli-mirage';
import moment from 'moment';
import RESPONSE_CODES from '../enums/response-codes';

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

//put it inside core/app/mirage/routes
//only the get
export default function() {
  // this.get('/admin/querystats', function({ querystats }) {
  //   return ['A', 'B', 'C'];
  // });
  console.log('Reached here!!!!!!');
  //this.namespace = 'admin'
  this.get('/querystats', function({ querystats }, request) {
    let idFilter = request.queryParams['filter[querystats.id]'];

    // Allow filtering
    if (idFilter) {
      let ids = idFilter.split(',');
      querystats = querystats.find(ids);
    } else {
      querystats = querystats.all();
    }

    return querystats;
  });

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
