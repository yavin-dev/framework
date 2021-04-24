// Types for compiled templates
declare module 'navi-dashboards/templates/*' {
  import { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
}

declare module 'ember-uuid';

type TODO<T = any> = T;
