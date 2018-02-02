import config from 'dummy/config/environment';
import BardLite from 'navi-data/mirage/routes/bard-lite';
import BardMeta from 'navi-data/mirage/routes/bard-meta';

export default function() {

  // https://github.com/kategengler/ember-cli-code-coverage#create-a-passthrough-when-intercepting-all-ajax-requests-in-tests
  this.passthrough('/write-coverage');

  // Mock bard facts + metadata
  this.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
  BardLite.call(this);
  BardMeta.call(this);
}
