<p align="center">
  <a href="https://yavin.dev">
    <img alt="yavin-logo" src="assets/yavin-logo-transparent.svg" height="150px"/>
  </a>
</p>
<h1 align="center">Yavin Framework</h1>
<p align="center">A framework for rapidly building production quality analytics applications</p>
<p align="center">
    <a href="https://yavin.dev">Docs</a> - <a href="https://yavin-dev.github.io/framework">Demo</a> - <a href="https://github.com/yavin-dev/framework/discussions">Community</a>
</p>

## Yavin Framework [![Pipeline Status][status-image]][status-url]

> **Note:** This repository contains the core code of the Yavin framework. If you want to build an application using Yavin, visit the [Yavin App Repository](https://github.com/yavin-dev/app).

Yavin is a framework for rapidly building custom data applications that offers both a UI and an API.
Yavin can also be deployed as a standalone business intelligence tool in a few simple steps.
Build reports, assemble dashboards, and explore data with ad-hoc queries.

Jump right in with the [demo app](https://yavin-dev.github.io/framework) or run it yourself by following our [quick start guide](https://yavin.dev/pages/guide/02-start.html).

![yavin demo app landing page](assets/yavin-demo-app.png)

## Packages

You can install the individual packages via npm
![npm (custom registry)](https://img.shields.io/npm/v/navi-app/latest?label=version)
![npm (custom registry)](https://img.shields.io/npm/v/navi-app/canary?label=alpha)
![npm (custom registry)](https://img.shields.io/npm/v/navi-app/beta?label=beta)

| Package                                                                                                                        | Description                                                          |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| [![navi-core](https://img.shields.io/npm/v/navi-core/beta?label=navi-core)][npm-navi-core]                                     | Library of visualizations and common components                      |
| [![navi-dashboards](https://img.shields.io/npm/v/navi-dashboards/beta?label=navi-dashboards)][npm-navi-dashboards]             | Collection of components for creating collections of visualization   |
| [![navi-data](https://img.shields.io/npm/v/navi-data/beta?label=navi-data)][npm-navi-data]                                     | Adapters and serializers for connecting to data sources (elide/fili) |
| [![navi-directory](https://img.shields.io/npm/v/navi-directory/beta?label=navi-directory)][npm-navi-directory]                 | Overview of all saved/favorited reports and dashboards               |
| [![navi-notifications](https://img.shields.io/npm/v/navi-notifications/beta?label=navi-notifications)][npm-navi-notifications] | Helper library for in app alerts                                     |
| [![navi-reports](https://img.shields.io/npm/v/navi-reports/beta?label=navi-reports)][npm-navi-reports]                         | Collection of components for building advanced ad-hoc reports        |

## Contributing

Assuming you have git, node (>=10), and [ember-cli](https://cli.emberjs.com/release/)

- `git clone https://github.com/yavin-dev/framework.git`
- `cd yavin`
- `CI=true npm install` (`CI=true` makes use of each package's `package-lock.json` file)
- `cd packages/reports` (or whichever package)
- `ember s` to run a local server
- Then `npm test` to test your changes

See [CONTRIBUTING.md](https://github.com/yavin-dev/framework/blob/main/CONTRIBUTING.md)

## Resources

- Documentation on [yavin.dev](https://yavin.dev)
- Chat on [spectrum.chat](https://spectrum.chat/yavin)
- Feature Roadmap [projects](https://github.com/yavin-dev/framework/projects)
- For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
- For more information on using lerna, visit [https://lerna.js.org](https://lerna.js.org)

## License

This project is licensed under the [MIT License](LICENSE.md).

[status-image]: https://cd.screwdriver.cd/pipelines/6102/badge
[status-url]: https://cd.screwdriver.cd/pipelines/6102
[npm-navi-core]: https://www.npmjs.com/package/navi-core
[npm-navi-dashboards]: https://www.npmjs.com/package/navi-dashboards
[npm-navi-data]: https://www.npmjs.com/package/navi-data
[npm-navi-directory]: https://www.npmjs.com/package/navi-directory
[npm-navi-notifications]: https://www.npmjs.com/package/navi-notifications
[npm-navi-reports]: https://www.npmjs.com/package/navi-reports
