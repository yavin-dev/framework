/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { htmlSafe } from '@ember/template';

// TODO: Replace once resolved https://github.com/typed-ember/ember-cli-typescript/issues/1155#issue-629409268
export type SafeString = ReturnType<typeof htmlSafe>;
export type MessageStyle = 'default' | 'info' | 'warning' | 'success' | 'danger';
export type MessageTimeout = 'short' | 'medium' | 'long' | 'none';

export interface MessageOptions {
  title: string | SafeString;
  context?: string | SafeString;
  style?: MessageStyle;
  timeout?: MessageTimeout;
  extra?: unknown;
}

export default interface NaviNotificationsService {
  add(options: MessageOptions): void;
  clear(): void;
}
