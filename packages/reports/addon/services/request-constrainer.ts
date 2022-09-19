/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service, { inject as service } from '@ember/service';
import { RequestActions } from './request-action-dispatcher';
import { matches } from 'lodash-es';
import type FragmentFactory from 'navi-core/services/fragment-factory';
import type RequestFragment from 'navi-core/models/request';
import type { RequestV2 } from '@yavin/client/request';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type Route from '@ember/routing/route';
import type UpdateReportActionDispatcher from './update-report-action-dispatcher';
import type ColumnFragment from 'navi-core/models/request/column';
import type FilterFragment from 'navi-core/models/request/filter';
import type NaviNotificationService from 'navi-core/services/interfaces/navi-notifications';
import type { ReportLike } from 'navi-reports/routes/reports/report';

export type TemplateDispatcherAction = [string, ...any[]] & any[];

type ConstrainedProperties = {
  columns?: Set<ColumnFragment>;
  filters?: Set<FilterFragment>;
};

export default class RequestConstrainer extends Service {
  @service fragmentFactory!: FragmentFactory;
  @service naviMetadata!: NaviMetadataService;
  @service updateReportActionDispatcher!: UpdateReportActionDispatcher;
  @service naviNotifications!: NaviNotificationService;

  buildConstraints(request: RequestFragment): TemplateDispatcherAction[] {
    if (!request.dataSource || !request.tableMetadata) {
      return [];
    }
    const { tableMetadata } = request;

    const serialized = request.serialize() as RequestV2;
    return tableMetadata.requestConstraints
      .filter(
        (requestConstraint) => !requestConstraint.isSatisfied(serialized) && requestConstraint.type === 'existence'
      )
      .map(({ constraint }) => {
        const { type, field } = constraint.matches;
        const columnMetadata = this.naviMetadata.getById(type, field, request.dataSource);
        if (constraint.property === 'filters') {
          const columnFragment = this.fragmentFactory.createColumn(
            type,
            request.dataSource,
            field,
            columnMetadata?.getDefaultParameters()
          );
          return [RequestActions.ADD_FILTER, columnFragment];
        } else {
          return [RequestActions.ADD_COLUMN_WITH_PARAMS, columnMetadata];
        }
      });
  }

  constrain(route: Route): ReportLike {
    const report = route.modelFor(route.routeName) as ReportLike;
    const { request } = report;

    const dispatcherActions = this.buildConstraints(request);
    dispatcherActions.forEach((action) => {
      const [actionName, ...args] = action;
      this.updateReportActionDispatcher.dispatch(actionName, route, ...args);
    });

    const serialized = request.serialize() as RequestV2;
    const unsatisfiedConstraints =
      request.tableMetadata?.requestConstraints.filter((c) => !c.isSatisfied(serialized)) || [];
    if (unsatisfiedConstraints.length > 0) {
      this.naviNotifications.add({
        title: `The following requirements are not satisfied`,
        context: unsatisfiedConstraints.map((c, idx) => `${idx + 1}) ${c.description}`).join(' '),
        style: 'warning',
        timeout: 'none',
      });
    }

    return report;
  }

  getConstrainedProperties(request: RequestFragment): ConstrainedProperties {
    if (!request.dataSource || !request.tableMetadata) {
      return {};
    }
    const { tableMetadata } = request;

    return tableMetadata.requestConstraints.reduce((props: ConstrainedProperties, requestConstraint) => {
      const { property, matches: partialProperties } = requestConstraint.constraint;
      const func = matches(partialProperties);

      //@ts-ignore
      const matchingProp = request[property].find(func);

      if (matchingProp) {
        //@ts-ignore
        props[property] = props[property] || new Set();
        props[property]?.add(matchingProp);
      }
      return props;
    }, {});
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'request-constrainer': RequestConstrainer;
  }
}
