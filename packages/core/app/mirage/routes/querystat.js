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

export default function() {
  this.get('/querystats', function({ querystats }, request) {
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
    querystats.models = querystatsModel;
    return querystats;
  });
}
