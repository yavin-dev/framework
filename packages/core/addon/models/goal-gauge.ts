/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { readOnly } from '@ember/object/computed';
import VisualizationBase from './visualization';
import { buildValidations, validator } from 'ember-cp-validations';
import RequestFragment from './bard-request-v2/request';
import { attr } from '@ember-data/model';
import { ResponseV1 } from 'navi-data/serializers/facts/interface';

/**
 * @constant {Object} Validations - Validation object
 */
const Validations = buildValidations(
  {
    //Selected metric list  is the same as request metric list
    'metadata.metricCid': validator('request-metric-exist', {
      dependentKeys: ['model._request.metricColumns.[]'],
    }),
    'metadata.baselineValue': validator('number', { allowString: false, allowNone: false }),
    'metadata.goalValue': validator('number', { allowString: false, allowNone: false }),
  },
  {
    //Global Validation Options
    request: readOnly('model._request'),
  }
);

export type GoalGaugeConfig = {
  type: 'goal-gauge';
  version: 2;
  metadata: {
    metricCid: string;
    baselineValue: number;
    goalValue: number;
  };
};

export default class GoalGaugeModel extends VisualizationBase.extend(Validations) implements GoalGaugeConfig {
  @attr('string', { defaultValue: 'goal-gauge' })
  type!: GoalGaugeConfig['type'];

  @attr('number', { defaultValue: 2 })
  version!: GoalGaugeConfig['version'];

  @attr({ defaultValue: () => ({}) })
  metadata!: GoalGaugeConfig['metadata'];

  /**
   * Rebuild config based on request and response
   *
   * @method rebuildConfig
   * @param {MF.Fragment} request - request model fragment
   * @param {Object} response - response object
   * @return {Object} this object
   */
  rebuildConfig(request: RequestFragment, response: ResponseV1): GoalGaugeModel {
    if (request && response) {
      const metricCid = request.metricColumns[0]?.cid;
      const canonicalName = request.metricColumns[0]?.canonicalName;
      const firstRow = response?.rows?.[0] || {};
      const actualValue = Number(firstRow[canonicalName] || 0);
      const above = actualValue * 1.1;
      const below = actualValue * 0.9;

      let baselineValue = actualValue > 0 ? below : above;
      let goalValue = actualValue > 0 ? above : below;

      //handle the zero value case
      if (actualValue === 0) {
        baselineValue = 0;
        goalValue = 1;
      }

      this.set('metadata', {
        metricCid,
        baselineValue,
        goalValue,
      });
    }
    return this;
  }
}
