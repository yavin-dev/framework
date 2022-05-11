type FragmentInstance = TODO;
declare module 'ember-data-model-fragments/fragment' {
  import Model from '@ember-data/model';
  export default Model; //TODO make me real
}

declare module 'ember-data-model-fragments/FragmentArray' {
  import MutableArray from '@ember/array/mutable';

  import Ember from 'ember';
  import ModuleComputed from '@ember/object/computed';
  /**
   * Deconstructs computed properties into the types which would be returned by `.get()`.
   */
  type ComputedPropertyGetters<T> = {
    [K in keyof T]: Ember.ComputedProperty<T[K], any> | ModuleComputed<T[K], any> | T[K];
  };

  type BaseEnumerable<T> = Array<T> & MutableArray<T>;
  export default interface FragmentArrayBase<T extends FragmentInstance> extends BaseEnumerable<T> {
    hasDirtyAttributes: Ember.ComputedProperty<boolean, boolean>;
    pushObject(fragment: FragmentInstance): FragmentInstance;
    removeFragment(fragment: FragmentInstance): this;
    serialize(): object[];
    get<T, K extends keyof T>(this: ComputedPropertyGetters<T>, key: K): T[K];
  }
}
