/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { set } from '@ember/object';
import { attr } from '@ember-data/model';
import Fragment from 'ember-data-model-fragments/fragment';
import { formTypeName } from 'navi-core/visualization/manifest';
import { cloneDeep, omit } from 'lodash-es';
import { inject as service } from '@ember/service';
import type RequestFragment from './request';
import type { ResponseV1 } from 'navi-data/serializers/facts/interface';
import type { VisualizationType } from 'navi-core/models/registry';
import type VisualizationModelV2 from './visualization-v2';
import type YavinVisualizationsService from 'navi-core/services/visualization';
import type { YavinVisualizationManifest } from 'navi-core/visualization/manifest';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  type: [
    validator('presence', {
      presence: true,
      ignoreBlank: true,
      message: 'The visualization must have a type',
    }),
  ],
});

export default class VisualizationFragment extends Fragment.extend(Validations) implements VisualizationModelV2 {
  @service declare visualization: YavinVisualizationsService;

  @attr('string')
  type!: string;

  // @attr('string')
  get namespace() {
    return ['metric-label', 'table'].includes(this.type) ? 'yavin' : 'c3';
  }

  @attr('number')
  version!: number;

  @attr()
  metadata: unknown;

  get typeName(): string {
    const { namespace, type } = this;
    return formTypeName(type, namespace);
  }

  get manifest(): YavinVisualizationManifest {
    return this.visualization.getVisualization(this.typeName);
  }

  /**
   * @property {Object} - temporary request object used for validation
   */
  _request!: RequestFragment;

  /**
   * Test if the config is valid for the given request
   *
   * @method isValidForRequest
   * @param {Object} request - request object
   * @return {Boolean} - is the config valid
   */
  isValidForRequest(request: RequestFragment) {
    set(this, '_request', request);
    //TODO Add validation mixin
    //@ts-ignore
    const { validations } = this.validateSync?.() || {};
    if (validations) {
      return validations.isValid;
    }
    return true;
  }

  /**
   * Rebuild config based on request and response
   *
   * @method rebuildConfig
   * @param {MF.Fragment} request - request model fragment
   * @param {Object} response - response object
   * @return {Object} this object
   */
  rebuildConfig(_request: RequestFragment, _response: ResponseV1) {
    /*
     * TODO: Enable this after figuring out the reason for ember-cp-validations failing
     * Ember.assert(`rebuildConfig is not implemented in ${this.constructor.modelName}`);
     */
  }

  /**
   * Serialize to json excluding namespace
   * @override
   */
  toJSON(): object {
    const json = super.toJSON() as this;
    const withoutNamespace = omit(json, 'namespace');
    return withoutNamespace;
  }

  clone(): VisualizationModelV2 {
    const { manifest, metadata } = this;
    const model = manifest.createModel();
    model.metadata = cloneDeep(metadata);
    return model;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TypedVisualizationFragment extends VisualizationFragment {
  type: VisualizationType;
}
