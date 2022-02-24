/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import type { TaskInstance } from 'ember-concurrency';

export interface SourceItem<Source = unknown> {
  name: string;
  description?: string;
  hide?: boolean;
  source: Source;
  isSuggested?: boolean;
}

interface Args {
  sourceType: string;
  emptyMsg: string;
  currentSource?: SourceItem;
  sourcesTask: TaskInstance<SourceItem[]>;
  setSource(source: SourceItem['source']): void;
  reset: () => void;
}

export default class ReportBuilderSourceSelector extends Component<Args> {}
