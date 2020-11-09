import DS from 'ember-data';
//@ts-ignore
import { fragment } from 'ember-data-model-fragments/attributes';
import TableFragment from 'navi-core/models/table';
import MetricLabel from 'navi-core/models/metric-label';
import GoalGauge from 'navi-core/models/goal-gauge';
import LineChartVisualization from 'navi-core/models/line-chart';
import PieChart from 'navi-core/models/pie-chart';
import BarChart from 'navi-core/models/bar-chart';

export default class AllTheFragments extends DS.Model {
  @fragment('line-chart', { defaultValue: {} })
  lineChart!: LineChartVisualization;
  @fragment('bar-chart', { defaultValue: {} })
  barChart!: BarChart;
  @fragment('table', { defaultValue: {} })
  table!: TableFragment;
  @fragment('goalGauge', { defaultValue: {} })
  goalGauge!: GoalGauge;
  @fragment('metricLabel', { defaultValue: {} })
  metricLabel!: MetricLabel;
  @fragment('pie-chart', { defaultValue: {} })
  pieChart!: PieChart;
}
// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'all-the-fragments': AllTheFragments;
  }
}
