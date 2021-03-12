/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import attr from 'ember-data/attr';
import Fragment from 'ember-data-model-fragments/fragment';
import FragmentArray from 'ember-data-model-fragments/FragmentArray';
//@ts-ignore
import { fragmentArray } from 'ember-data-model-fragments/attributes';
import LayoutFragment from './layout';

export default class PresentationFragment extends Fragment {
  @attr('number', { defaultValue: 12 }) columns!: number;

  @fragmentArray('fragments/layout', { defaultValue: () => [] }) layout!: FragmentArray<LayoutFragment>;

  @attr('number', { defaultValue: 1 }) version!: number;

  /**
   * Clones presentation model
   *
   * @returns Ember model data fragment clone of current presentation
   */
  copy(): PresentationFragment {
    const presentation = this.toJSON() as PresentationFragment;

    return this.store.createFragment('fragments/presentation', {
      columns: presentation.columns,
      version: presentation.version,
      layout: presentation.layout.map((cell) => this.store.createFragment('fragments/layout', cell)),
    });
  }
}

declare module '../registry' {
  export interface FragmentRegistry {
    'fragments/presentation': PresentationFragment;
  }
}
