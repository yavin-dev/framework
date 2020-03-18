import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class NaviSearchBarComponent extends Component {
  @service('navi-search-provider') searchProviderService;

  @tracked searchQuery = '';
  @tracked searchResults = [];
  @tracked hasFocus = false;

  emptyResult = [
    {
      title: '',
      component: 'navi-search-result/no-result'
    }
  ];

  @action
  async search(event) {
    if (this.searchQuery == '') {
      this.searchResults = [];
    }
    if (event.code == 'Enter' || this.searchQuery.length > 1) {
      this.searchResults = await this.searchProviderService.search.perform(this.searchQuery);
      if (this.searchResults.length == 0 && this.searchQuery != '') {
        this.searchResults = this.emptyResult;
      }
    }
  }

  @action
  focusIn() {
    this.hasFocus = true;
  }

  @action
  focusOut() {
    this.hasFocus = false;
  }
}
