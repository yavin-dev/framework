import Model from '@ember-data/model';
//@ts-ignore
import { fragment } from 'ember-data-model-fragments/attributes';
import GoalGauge from '@yavin/c3/models/goal-gauge';
import LineChartVisualization from '@yavin/c3/models/line-chart';
import PieChart from '@yavin/c3/models/pie-chart';
import BarChart from '@yavin/c3/models/bar-chart';

export default class AllTheFragments extends Model {
  @fragment('line-chart', { defaultValue: {} })
  declare lineChart: LineChartVisualization;

  @fragment('bar-chart', { defaultValue: {} })
  declare barChart: BarChart;

  @fragment('goalGauge', { defaultValue: {} })
  declare goalGauge: GoalGauge;

  @fragment('pie-chart', { defaultValue: {} })
  declare pieChart: PieChart;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'all-the-fragments': AllTheFragments;
  }
}
