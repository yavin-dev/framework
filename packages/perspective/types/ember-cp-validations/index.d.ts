declare module 'ember-cp-validations' {
  export type EmberCPValidationsMixin = {
    validations: TODO;
    validate(): Promise<Pick<EmberCPValidationsMixin, 'validations'>>;
  };
  function buildValidations(validation: TODO, ...args: TODO[]): EmberCPValidationsMixin;
  function validator(name: string, ...options: TODO[]): TODO;
  export { buildValidations, validator };
}
