/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import attr from 'ember-data/attr';
import Fragment from 'ember-data-model-fragments/fragment';

export default class LayoutFragment extends Fragment {
  @attr('number') column!: number;
  @attr('number') row!: number;
  @attr('number') width!: number;
  @attr('number') height!: number;
  @attr('number') widgetId!: number;
}

declare module '../registry' {
  export interface FragmentRegistry {
    'fragments/layout': LayoutFragment;
  }
}
