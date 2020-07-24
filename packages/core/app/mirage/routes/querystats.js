import Mirage from 'ember-cli-mirage';

//put it inside core/app/mirage/routes
//only the get
export default function() {
  this.get('/querystats', function({ querystats }) {
    return ['A', 'B', 'C'];
  });
}
