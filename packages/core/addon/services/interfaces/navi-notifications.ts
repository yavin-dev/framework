/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { SafeString } from 'handlebars';

export type MessageStyle = 'default' | 'info' | 'warning' | 'success' | 'danger';
export type MessageTimeout = 'short' | 'medium' | 'long' | 'none';

export interface MessageOptions {
  title: string | SafeString;
  context?: string;
  style?: MessageStyle;
  timeout?: MessageTimeout;
  extra?: unknown;
}

export default interface NaviNotificationsService {
  add(options: MessageOptions): void;
  clear(): void;
}
