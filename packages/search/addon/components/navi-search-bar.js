import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class NaviSearchBarComponent extends Component {
  @service('navi-search-provider') searchProviderService;

  @tracked searchQuery;
  @tracked searchResults;

  @action
  async search() {
    this.searchResults = await this.searchProviderService.search(this.searchQuery);
  }
}
