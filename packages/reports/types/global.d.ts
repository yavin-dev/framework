// Types for compiled templates
declare module 'navi-reports/templates/*' {
  import { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
}

type Dict<T = string> = { [key: string]: T };
type TODO<T = any> = T;
