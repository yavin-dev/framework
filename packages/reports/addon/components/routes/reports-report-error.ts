/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import NaviAdapterError from 'navi-data/errors/navi-adapter-error';

interface NaviReportErrorRouteArgs {
  error?: NaviAdapterError | Error;
}

export default class NaviReportErrorRoute extends Component<NaviReportErrorRouteArgs> {
  message = 'Oops! There was an error with your request.';
  get details(): string[] {
    const { error } = this.args;
    return error instanceof NaviAdapterError ? error.details : [];
  }
}
