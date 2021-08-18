// Types for compiled templates
declare module 'navi-data/templates/*' {
  import { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
}

declare module 'ember-apollo-client';
declare module 'ember-apollo-client/services/apollo';
declare module 'ember-uuid';
declare module 'ember-cli-mirage';

type TODO<T = any> = T;

// Apollo GraphQL imports
declare module '*.graphql' {
  const doc: import('graphql').DocumentNode;
  export default doc;
}
