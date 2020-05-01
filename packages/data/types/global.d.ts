// Types for compiled templates
declare module 'navi-data/templates/*' {
  import { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
}

declare module 'ember-get-config';

type Dict<T = string> = { [key: string]: T };
type TODO<T = any> = T;
