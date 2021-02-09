/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import NaviFactsService from 'navi-data/services/navi-facts';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import { RequestV2 } from 'navi-data/adapters/facts/interface';

/**
 * Returns true if a string is a URL
 * @param string the string to check if it is a URL
 */
function isValidUrl(string: string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }
  return true;
}

interface Args {
  request: RequestFragment;
}
export default class GetApiActionComponent extends Component<Args> {
  @service
  naviFacts!: NaviFactsService;

  get requestUrl() {
    const request = this.args.request.serialize() as RequestV2;
    return this.naviFacts.getURL(request, { dataSourceName: request.dataSource });
  }

  get isRequestURL() {
    return isValidUrl(this.requestUrl || '');
  }
}
