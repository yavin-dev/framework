import Component from '@glimmer/component';
import ApplicationInstance from '@ember/application/instance';
import { getContext } from '@ember/test-helpers';
//@ts-ignore
import GlimmerComponentManager from 'dummy/component-managers/glimmer';

// https://timgthomas.com/2019/11/unit-testing-glimmer-components/
export function createGlimmerComponent(lookupPath: string, named: Record<string, unknown> = {}): Component {
  const owner = (getContext() as any).owner as ApplicationInstance;
  const { class: componentClass } = owner.factoryFor(lookupPath);
  return createGlimmerClass(componentClass, named);
}

export function createGlimmerClass<T extends Component>(
  glimmerComponent: T,
  named: Record<string, unknown> = {}
): Component {
  const owner = (getContext() as any).owner as ApplicationInstance;
  const componentManager = new GlimmerComponentManager(owner);
  return componentManager.createComponent(glimmerComponent, { named });
}
