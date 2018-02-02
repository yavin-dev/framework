import Ember from 'ember';

export function stringContains(source, substring) {
  return source.includes(substring);
}

export default Ember.Helper.helper(args => stringContains(...args));
