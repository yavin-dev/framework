/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import type DeliverableItemModel from 'navi-core/models/deliverable-item';
import type UserModel from 'navi-core/models/user';

interface Args {
  user: UserModel;
  item: DeliverableItemModel;
  onToggle(): void;
}

export default class FavoriteItemComponent extends Component<Args> {
  get itemType(): 'report' | 'dashboard' {
    //@ts-ignore
    return this.args.item.constructor.modelName;
  }

  get favoriteItems(): Array<DeliverableItemModel> {
    const { itemType } = this;
    if ('report' === itemType) {
      return this.args.user.favoriteReports.toArray();
    }
    if ('dashboard' === itemType) {
      return this.args.user.favoriteDashboards.toArray();
    }
    return [];
  }

  get isFavorite() {
    return this.favoriteItems.includes(this.args.item);
  }
}
