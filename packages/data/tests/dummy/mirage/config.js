import BardMeta from 'navi-data/mirage/routes/bard-meta';
import config from 'dummy/config/environment';

export default function() {
  this.passthrough('/write-coverage');

  // Mock bard facts + metadata
  this.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
  BardMeta.call(this);
}
