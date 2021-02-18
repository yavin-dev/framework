import config from 'dummy/config/environment';
import BardMeta from 'navi-data/mirage/routes/bard-meta';
import BardFacts from 'navi-data/mirage/routes/bard-lite';
import GraphQL from 'navi-data/mirage/routes/graphql';

export default function () {
  this.passthrough('/write-coverage');

  // Mock bard facts + metadata
  for (let dataSource of config.navi.dataSources) {
    if ('elide' === dataSource.type) {
      this.urlPrefix = dataSource.uri;
      GraphQL.call(this);
    } else if ('bard' === dataSource.type) {
      this.urlPrefix = `${dataSource.uri}/v1`;
      BardMeta.call(this);
      BardFacts.call(this);
    }
  }
}
