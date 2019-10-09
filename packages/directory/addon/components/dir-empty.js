import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/dir-empty';
import FileTypes from 'navi-directory/utils/enums/file-types';

export default Component.extend({
  layout,
  classNames: ['dir-empty'],
  reportRoute: computed(function() {
    return FileTypes.definitions.reports.linkRoute;
  })
});
