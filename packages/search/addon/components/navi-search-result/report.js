import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class Report extends Component {
  @service('navi-report-search-provider') reportSearchProvider;

  @tracked searchResult;

  title = 'Reports & Dashboards';

  @action
  async search(element, query) {
    this.searchResult = await this.reportSearchProvider.search(query);
  }
}
