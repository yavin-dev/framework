/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';
import { SourceItem } from './source-selector';

interface Args {
  sources: SourceItem[];
  currentSource?: SourceItem;
  setSource(source: SourceItem['source']): void;
}

export default class ReportBuilderSourceSelector extends Component<Args> {
  guid = guidFor(this);
}
