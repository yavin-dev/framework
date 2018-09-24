/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';

export default Route.extend({
    /**
     * @method redirect
     * @overrride
     */
    redirect() {
        this.transitionTo('directory.my-data');
    }
});
