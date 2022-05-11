import EmberLib from 'ember';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Array<T> extends EmberLib.ArrayPrototypeExtensions<T> {}
  // interface Function extends Ember.FunctionPrototypeExtensions {}
  interface EmberApp {
    testing: boolean;
  }
  const Ember: EmberApp;
}

export {};
