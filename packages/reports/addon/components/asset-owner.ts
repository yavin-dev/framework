/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@glimmer/component';
import moment from 'moment';

interface ReportUserArgs {
  user: string;
  updatedOn: string;
}

export default class ReportUser extends Component<ReportUserArgs> {
  get updatedon(): string {
    return 'Last Modified on ' + moment(this.args.updatedOn).format('lll');
  }
}
