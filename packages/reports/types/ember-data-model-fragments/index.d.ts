type FragmentInstance = TODO;
declare module 'ember-data-model-fragments/fragment' {
  import DS from 'ember-data';
  export default DS.Model; //TODO make me real
}

declare module 'ember-data-model-fragments/FragmentArray' {
  import MutableArray from '@ember/array/mutable';
  type BaseEnumerable<T> = Array<T> & MutableArray<T>;
  export default interface FragmentArrayBase<T extends FragmentInstance> extends BaseEnumerable<T> {
    pushObject(fragment: FragmentInstance): FragmentInstance;
    removeFragment(fragment: FragmentInstance): this;
  }
}
