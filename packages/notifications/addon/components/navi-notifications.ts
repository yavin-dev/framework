/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
//@ts-ignore
import move from 'ember-animated/motions/move';
//@ts-ignore
import { fadeOut } from 'ember-animated/motions/opacity';
import { easeOut } from 'ember-animated/easings/cosine';
import TransitionContext from 'ember-animated/-private/transition-context';

export default class NaviNotifications extends Component {
  @service
  flashMessages!: unknown;

  *transition({ keptSprites, insertedSprites, removedSprites }: TransitionContext): Generator {
    for (const sprite of insertedSprites) {
      sprite.startTranslatedBy(0, -(sprite?.finalBounds?.height || 0));
      move(sprite, { easing: easeOut });
    }

    for (const sprite of keptSprites) {
      move(sprite);
    }

    for (const sprite of removedSprites) {
      fadeOut(sprite);
    }
    yield;
  }
}
