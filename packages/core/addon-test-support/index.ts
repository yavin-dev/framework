import Component from '@glimmer/component';
import { getContext } from '@ember/test-helpers';
import { TestContext } from 'ember-test-helpers';
//@ts-ignore
import GlimmerComponentManager from 'dummy/component-managers/glimmer';

/**
 * Creates an instance of a glimmer component
 * @see https://timgthomas.com/2019/11/unit-testing-glimmer-components/
 * @param lookupPath - the `component:${componentName}` path to the component
 * @param args - the named arguments to be supplied as `args` to the glimmer component
 */
export function createGlimmerComponent(lookupPath: string, args: Record<string, unknown> = {}): Component {
  const owner = (getContext() as TestContext).owner;
  const { class: componentClass } = owner.factoryFor(lookupPath);
  return createGlimmerClass(componentClass, args);
}

/**
 * Creates an instance of a glimmer component given the class
 * @param glimmerComponent - the class of the glimmer component to create
 * @param args - the named arguments to be supplied as `args` to the glimmer component
 */
export function createGlimmerClass<
  T extends Component,
  C extends { new (owner: TestContext['owner'], args: T['args']): T }
>(glimmerComponent: C, args: T['args']): Component {
  const owner = (getContext() as TestContext).owner;
  const componentManager = new GlimmerComponentManager(owner);
  return componentManager.createComponent(glimmerComponent, { named: args });
}
