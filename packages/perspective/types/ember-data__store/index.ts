import { FragmentRegistry } from 'navi-core/models/registry';

declare module '@ember-data/store' {
  export default interface Store {
    createFragment<K extends keyof FragmentRegistry>(fragmentName: K, attributes: object): FragmentRegistry[K];
  }
}
