import DS from 'ember-data';

/**
 * Catch-all for ember-data.
 */
export default interface ModelRegistry {
  [key: string]: DS.Model;
}
