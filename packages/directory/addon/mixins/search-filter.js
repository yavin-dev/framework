/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Mixin from '@ember/object/mixin';
import { inject as controller } from '@ember/controller';
import { computed, get } from '@ember/object';
import { searchRecords } from 'navi-core/utils/search';
import { isEmpty } from '@ember/utils';

export default Mixin.create({
    /**
     * @property directory - directory controller
     */
    directory: controller(),

    /**
     * @property {Promise} searchResults - Search and rank through items in model when a search query is available
     */
    searchResults: computed('directory.q', 'sortedItems', function() {
        let queryString = get(this, 'directory.q');
        return get(this, 'sortedItems').then(
            items => isEmpty(queryString) ? items : searchRecords(items, queryString, 'title')
        );
    })
});
