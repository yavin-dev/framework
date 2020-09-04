declare module 'ember-cp-validations' {
  type EmberCPValidationsMixin = {
    validations: TODO;
  };
  function buildValidations(validation: TODO, ...args: TODO[]): EmberCPValidationsMixin;
  function validator(name: string, options?: TODO): TODO;
  export { buildValidations, validator };
}
