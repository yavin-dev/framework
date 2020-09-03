import Component from '@glimmer/component';
import ApplicationInstance from '@ember/application/instance';
import { getContext } from '@ember/test-helpers';
//@ts-ignore
import GlimmerComponentManager from 'dummy/component-managers/glimmer';

/**
 * Creates an instance of a glimmer component
 * @see https://timgthomas.com/2019/11/unit-testing-glimmer-components/
 * @param lookupPath - the `component:${componentName}` path to the component
 * @param named the named arguments to be supplied as `args` to the glimmer component
 */
export function createGlimmerComponent(lookupPath: string, named: Record<string, unknown> = {}): Component {
  const owner = (getContext() as any).owner as ApplicationInstance;
  const { class: componentClass } = owner.factoryFor(lookupPath);
  return createGlimmerClass(componentClass, named);
}

/**
 * Creates an instance of a glimmer component given the class
 * @param glimmerComponent - the class of the glimmer component to create
 * @param named - the named arguments to be supplied as `args` to the glimmer component
 */
export function createGlimmerClass<T extends Component>(
  glimmerComponent: T,
  named: Record<string, unknown> = {}
): Component {
  const owner = (getContext() as any).owner as ApplicationInstance;
  const componentManager = new GlimmerComponentManager(owner);
  return componentManager.createComponent(glimmerComponent, { named });
}
