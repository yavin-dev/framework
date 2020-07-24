import DS from 'ember-data';

export default DS.RESTAdapter.extend({
  namespace: 'admin'
  //set the host here
  //import route from core => makes more sense
  //something wrong with config maybe
  //json api base class to see how it is set
  //base-json-api-adapter
});
