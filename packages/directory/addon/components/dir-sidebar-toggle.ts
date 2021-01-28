/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <DirSidebarToggle />
 */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { inject as controller } from '@ember/controller';
import { action, computed } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import DirectoryController from 'navi-directory/controllers/directory';

export default class DirSidebarToggleComponent extends Component {
  /**
   * @property router - service to check current route
   */
  @service router!: RouterService;

  /**
   * @property directory - controller for the directory route
   */
  @controller directory!: DirectoryController;

  /**
   * Only show the hamburger toggle on directory routes
   */
  @computed('router.currentRouteName')
  get isVisible(): boolean {
    return this.router.isActive('directory');
  }

  /**
   * Toggles the directory sidebar on the controller
   */
  @action
  toggleSidebar() {
    this.directory.toggleSidebar();
    const sidebar = document.querySelector('.dir-sidebar') as HTMLElement | undefined;
    if (sidebar) {
      sidebar.focus();
    }
  }
}
