import config from 'dummy/config/environment';
import BardMeta from 'navi-data/mirage/routes/bard-meta';
import GraphQL from 'navi-data/mirage/routes/graphql';

export default function() {
  this.passthrough('/write-coverage');

  // Mock bard facts + metadata
  for (let dataSource of config.navi.dataSources) {
    this.urlPrefix = `${dataSource.uri}/v1`;
    BardMeta.call(this);
  }

  this.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
  GraphQL.call(this);
}
