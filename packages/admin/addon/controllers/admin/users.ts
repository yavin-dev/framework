/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { camelize } from '@ember/string';
import { A as arr } from '@ember/array';
// @ts-ignore
import Table from 'ember-light-table';

/**
 * @constant COLUMNS
 */
const COLUMNS = ['Id'];

export default class AdminUsersController extends Controller {
  /**
   * @property {boolean} isUserModalOpen
   */
  @tracked isAddUserModalOpen = false;

  /**
   * @property {Number} userCount
   */
  get userCount(): number {
    return this.model.users.length;
  }

  get table() {
    return Table.create({
      columns: this.columns,
      rows: this.rows
    });
  }

  /**
   * @property {Array} columns
   */
  get columns(): Array<Object> {
    return COLUMNS.map(column => {
      return { name: column, valuePath: camelize(column) };
    });
  }

  get rows(): TODO {
    const rows = arr();
    rows.pushObjects(this.model.users);
    return rows;
  }

  /**
   * @method addUser
   */
  @action
  addUser(): void {
    this.isAddUserModalOpen = false;
    // TODO add user method
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    users: AdminUsersController;
  }
}
