// Types for compiled templates
declare module '@yavin-ui/perspective/templates/*' {
  import { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TODO<T = any> = T;
