// Types for compiled templates
declare module '@yavin/perspective/templates/*' {
  import { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TODO<T = any> = T;

declare namespace Intl {
  type Key = 'calendar' | 'collation' | 'currency' | 'numberingSystem' | 'timeZone' | 'unit';
  const supportedValuesOf: (input: Key) => string[];
}
