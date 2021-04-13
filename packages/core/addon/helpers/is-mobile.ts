/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Helper from '@ember/component/helper';
import type ScreenService from 'navi-core/services/screen';
import { inject as service } from '@ember/service';

export default class IsMobileHelper extends Helper {
  @service
  declare screen: ScreenService;

  compute() {
    return this.screen.isMobile;
  }
}
