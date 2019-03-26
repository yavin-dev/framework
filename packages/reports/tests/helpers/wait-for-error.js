import { waitUntil } from 'ember-native-dom-helpers';
import Ember from 'ember';

export default function waitForError(opts) {
  const orig = Ember.onerror;

  let error = null;
  Ember.onerror = err => {
    error = err;
  };

  return waitUntil(() => error, opts).finally(() => {
    Ember.onerror = orig;
  });
}
