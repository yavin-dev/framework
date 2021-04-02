// Types for compiled templates
declare module 'navi-search/templates/*' {
  import { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
}

type TODO<T = any> = T;
