import { Model, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  reports: hasMany('report', { inverse: 'author' }),
  dashboards: hasMany('dashboard', { inverse: 'author' }),
  deliveryRules: hasMany('delivery-rule', { inverse: 'owner' }),
  favoriteReports: hasMany('report', { inverse: null }),
  favoriteDashboards: hasMany('dashboard', { inverse: null })
});
