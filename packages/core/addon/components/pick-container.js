/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{#pick-container selection=selectedValue as |selection actions|}}
 *      {{#pick-value}}
 *      {{/pick-value}}
 *      {{#pick-form}}
 *      {{/pick-form}}
 *   {{/pick-container}}
 */
import Ember from 'ember';
import Layout from '../templates/components/pick-container';

const { get, computed } = Ember;

export default Ember.Component.extend({
  layout: Layout,

  classNames: ['pick-container'],

  /**
   * @property {Object} selection - the currently selected value
   */
  selection: null,

  /**
   * @property {Object} _editableSelection - a temporary, modifiable copy of selection
   * @private
   */
  _editableSelection: null,

  /**
   * @property {Boolean} autoClose - whether or not form closes after applying new selection
   */
  autoClose: true,

  /**
   * @property {Boolean} isFormOpen - whether or not the inner pick-form component is in the open state
   */
  isFormOpen: false,

  /**
   * @property {Boolean} pickActionHandler - used by child components to identify parent container
   */
  pickActionHandler: true,

  /**
   * @property {Object} _registered - object hash containing all registered child components
   * @private
   */
  _registered: undefined,

  /**
   * @property {String} _clickEventName - click event with unique namespace based on
   *                                      component's auto-generated id
   * @private
   */
  _clickEventName: computed('elementId', function() {
    return 'click.' + this.get('elementId');
  }),

  /**
   * @method getStagedSelection
   * @returns {Object} internal selection state with latest staged changes
   */
  getStagedSelection() {
    return this.get('_editableSelection');
  },

  /*
   * @method copySelection - clear any temporary changes and set internal selection state to a copy of outside state
   */
  copySelection: Ember.observer('selection', function() {
    let selection = this.get('selection'),
      copy;

    //If type is object or ember object instance
    if (Ember.typeOf(selection) === 'object' || Ember.typeOf(selection) === 'instance') {
      //deep copy object
      copy = Ember.assign({}, selection);
    } else {
      copy = Ember.copy(selection);
    }

    this.set('_editableSelection', copy);
  }),

  /**
   * @method init
   * @override
   */
  init() {
    this._super(...arguments);

    // Initialize selection
    this.copySelection();

    // Set _registered in init so it is not shared across all instances of this component
    this.set('_registered', {});

    // Setup "click off container" event
    Ember.$(document).on(this.get('_clickEventName'), event => {
      /*
       * Since jQuery can't find the closest parent of stale elements,
       * ignore click events if the element was removed by another
       * click event handler. This prevents a click on an element
       * removed from the form being considered outside of the form.
       */
      if (!Ember.$.contains(document.documentElement, event.target)) {
        return;
      }

      // Determine whether or not click came from inside form
      if (Ember.$(event.target).closest('.pick-container').length === 0) {
        this._clickOffElement();
      }
    });
  },

  /**
   * @method didInsertElement
   * @override
   */
  didInsertElement() {
    this._super(...arguments);

    this._updateFormVisibility();
  },

  /**
   * @method willDestroyElement
   * @override
   */
  willDestroyElement() {
    this._super(...arguments);

    Ember.$(document).off(this.get('_clickEventName'));
  },

  /**
   * @method register - registers child component, giving parent access
   * @param {String} name - registration name - component will be stored as _registered.name
   * @param {Object} component - reference to component being registered
   */
  register(name, component) {
    let registeredComponents = this.get('_registered');

    Ember.assert(name + ' is already registered', !registeredComponents[name]);
    registeredComponents[name] = component;
  },

  /**
   * @method toggleForm - toggles pick-form between open and closed states
   * Calls onFormToggled handler.
   */
  toggleForm() {
    this.toggleProperty('isFormOpen');
    this._updateFormVisibility();
    const handleFormToggled = get(this, 'onFormToggled');

    // Notify parents that the form has been toggled
    if (handleFormToggled) handleFormToggled(get(this, 'isFormOpen'));
  },

  /**
   * @method _updateFormVisibility - if there is a form element, change the visibility property
   *                                 to match `isFormOpen`
   * @private
   */
  _updateFormVisibility() {
    let formComponent = this.get('_registered.pickForm');
    if (formComponent) {
      formComponent.set('isVisible', this.get('isFormOpen'));
    }
  },

  /**
   * @method _clickOffElement - close the form if it's open
   * @private
   */
  _clickOffElement() {
    if (this.get('isFormOpen')) {
      this.toggleForm();

      // Reset form
      this.copySelection();
    }
  },

  actions: {
    /**
     * @action valueClicked - toggles form state
     */
    valueClicked() {
      this.toggleForm();

      // Reset form
      this.copySelection();
    },

    /**
     * @action applyChanges - Calls `onUpdateSelection` handler.
     * @param {Object} newSelection - if provided, this will become the selection value,
     *                                otherwise, the current internal selection will be used
     */
    applyChanges(newSelection) {
      const selection = newSelection || get(this, '_editableSelection');
      const handleUpdateSelection = get(this, 'onUpdateSelection');

      if (handleUpdateSelection) handleUpdateSelection(selection);
      if (get(this, 'autoClose')) this.toggleForm();
    },

    /**
     * @method stageChanges - update container's internal selection state without affected outside state
     * @param {Object} stagedSelected - new, updated selection state
     */
    stageChanges(stagedSelection) {
      this.set('_editableSelection', stagedSelection);
    },

    /**
     * @method discardChanges - clear any temporary changes and set internal selection state to outside state
     */
    discardChanges() {
      this.copySelection();
    }
  }
});
