/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

export interface SourceItem<Source = unknown> {
  name: string;
  description?: string;
  source: Source;
}

interface Args {
  currentSource?: SourceItem;
  sources: SourceItem[];
  setSource(source: SourceItem['source']): void;
}

export default class ReportBuilderSourceSelector extends Component<Args> {
  guid = guidFor(this);
}
