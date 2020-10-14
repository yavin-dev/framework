declare module 'ember-get-config' {
  import NaviConfig from 'navi-config';
  const value: {
    modulePrefix: string;
    navi: NaviConfig;
  };
  export default value;
}
