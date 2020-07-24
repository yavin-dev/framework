import { helper } from '@ember/component/helper';

function getColumns() {
  return ['Name', 'Age', 'School'];
}

export default helper(getColumns);
