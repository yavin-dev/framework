import Ember from 'ember';
import users from './users';

let naviUsers = Ember.A(users),
    dashboards = {
      'navi_user': [ 1, 2 ],
      'ciela': [ 3, 4 ]
    },
    deliveryRules = {
      'navi_user': [1],
      'ciela': []
    },
    favoriteDashboards = {
      'navi_user': [ 1 ],
      'ciela': []
    };

naviUsers.forEach(user => {
  user.deliveryRules = [];
  user.dashboards = dashboards[user.id];
  user.favoriteDashboards = favoriteDashboards[user.id];
  user.deliveryRules = deliveryRules[user.id];
});

// Prevent error involving fixtures files requiring an array export
export default [];
