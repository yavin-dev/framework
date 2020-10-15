declare module 'ember-get-config' {
  import NaviConfig from 'navi-config';
  import config from 'dummy/config/environment';
  const value: typeof config & { navi: NaviConfig };
  export default value;
}
