/**
 * Copyright 2020, Yahoo Holdings Inc.
 *
 * Component that is used to show items in parameter value power select
 */
import Component from '@glimmer/component';

type Arg =
  | { name: string; description?: string }
  | { name: string; description?: string; groupName: string; options: Array<Arg> };

interface ParamterListItemArgs {
  argument: Arg;
  parameters?: Arg[];
}

export default class ParamterListItem extends Component<ParamterListItemArgs> {
  get displayField(): 'name' | 'description' {
    return this.args.argument.name ? 'name' : 'description';
  }

  get display(): string {
    return this.args.argument[this.displayField] || '';
  }

  get showId(): boolean {
    const { parameters, argument } = this.args;
    if (!Array.isArray(parameters) || !argument[this.displayField]) {
      return true;
    }

    //normalized grouped parameters and flatten them out
    const normalizedParams: Arg[] = parameters
      .map((param) => {
        if ('groupName' in param && param.groupName) {
          return param.options;
        }
        return param;
      })
      .flat();
    return normalizedParams.filter((param) => param[this.displayField] === argument[this.displayField]).length > 1;
  }
}
