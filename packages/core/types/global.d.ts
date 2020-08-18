// Types for compiled templates
declare module 'navi-core/templates/*' {
  import { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
}

type Dict<T = string> = { [key: string]: T };
type TODO<T = any> = T;

type FragmentInstance = TODO;
declare module 'ember-data-model-fragments/fragment' {
  import DS from 'ember-data';
  export default DS.Model; //TODO make me real
}

declare module 'ember-data-model-fragments/FragmentArray' {
  import MutableArray from '@ember/array/mutable';
  type BaseEnumerable<T> = Array<T> & MutableArray<T>;
  export default interface FragmentArrayBase<T extends FragmentInstance> extends BaseEnumerable<T> {
    pushObject(fragment: FragmentInstance): TODO;
    removeFragment(fragment: FragmentInstance): TODO;
  }
}

declare module 'ember-cp-validations' {
  type EmberCPValidationsMixin = {
    validations: TODO;
  };
  function buildValidations(validation: TODO): EmberCPValidationsMixin;
  function validator(name: string, options?: TODO): TODO;
  export { buildValidations, validator };
}

declare module '@ember-data/store' {
  import DS from 'ember-data';
  export default interface Store extends DS.Store {
    createFragment(fragment: string, payload: unknown): FragmentInstance;
  }
}
