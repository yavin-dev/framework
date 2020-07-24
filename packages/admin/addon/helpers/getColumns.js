import { helper } from '@ember/component/helper';

function getColumns() {
  return ['Name', 'Age'];
}

export default helper(getColumns);
