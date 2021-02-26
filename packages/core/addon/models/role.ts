/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import attr from 'ember-data/attr';
import Model from '@ember-data/model';
import { Moment } from 'moment';

export default class Role extends Model {
  @attr('moment') createdOn!: Moment;
  @attr('moment') updatedOn!: Moment;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    role: Role;
  }
}
