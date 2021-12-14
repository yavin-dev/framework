import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';
import embed from 'vega-embed';
import type { VisualizationSpec } from 'vega-embed';
import { action } from '@ember/object';

interface VegaViewArgs {
  spec: VisualizationSpec;
}

export default class VegaView extends Component<VegaViewArgs> {
  guid = guidFor(this);

  colorScale?: (value: unknown) => string;

  @action
  async render() {
    const tooltipOptions = {
      formatTooltip: (values: Record<string, unknown>, sanitize: (x: unknown) => unknown) => {
        let tooltip = '<table><tbody>';
        Object.entries(values).forEach(([key, value]) => {
          tooltip += `<tr><td class="key" style="color:${this.colorScale?.(
            key
          )}">${key}</td><td class="value">${sanitize(value)}</td></tr>`;
        });
        tooltip += '</tbody></table>';
        return tooltip;
      },
    };

    const result = await embed(`#${this.guid}`, this.args.spec, {
      theme: 'quartz',
      config: { legend: { orient: 'bottom', symbolDirection: 'horizontal', layout: { bottom: { anchor: 'middle' } } } },
      tooltip: tooltipOptions,
    });
    this.colorScale = result.view.scale('color');
  }
}
