window.NAVI_APP = {
	version: '1.0.0',
  dataSources: [{ name: "default", uri: "https://www.naviapp.io/fact", type: "bard" }],
  appPersistence: {
    type: "elide",
    uri: "https://www.naviapp.io/persistence",
    timeout: 90000
  }
	FEATURES: {},
};
