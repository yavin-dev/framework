import Mirage from 'ember-cli-mirage';

//put it inside core/app/mirage/routes
//only the get
export default function() {
  // this.get('/admin/querystats', function({ querystats }) {
  //   return ['A', 'B', 'C'];
  // });
  console.log('Reached here!!!!!!');
  //this.namespace = 'admin'
  this.get('/querystats');
  this.post('/querystats');
}
