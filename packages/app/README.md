# Navi App

**An indispensable guide to exploring your data.**

## Prerequisites

- Setup [Fili](https://github.com/yahoo/fili) API instance
- Setup a Navi webservice instance

## Installation

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (with npm)
- [Ember CLI](https://ember-cli.com/)
- [Google Chrome](https://google.com/chrome/)

| Setting            | Description                      |
| ------------------ | -------------------------------- |
| factApiHost        | Bard/Fili Host for factual data  |
| persistenceApiHost | Navi WS host for app persistence |

- Update `package.json`
  - Update `description` field
  - Update `version` field

## FAQ

### How do I use a different app name?

- Update `package.json` `name` field
- Steps coming soon

### I don't have Fili/Navi WS setup yet. Can I test Navi App using mock data?

Yes! Steps coming soon.

## Embed Navi to an existing Ember App

If you have an existing Ember.JS app and would like to add Navi functionality to it, checkout the following Ember Addons:

- [Navi Core](https://npmjs.com/package/navi-core)
- [Navi Reports](https://npmjs.com/package/navi-reports)
- [Navi Dashboards](https://npmjs.com/package/navi-dashboards)
- [Navi Visualizations](https://npmjs.com/package/navi-visualizations) (DEPRECATED)
- [Navi Data](https://npmjs.com/package/navi-data)
- [Navi Directory](https://npmjs.com/package/navi-data)

## Local Development

You will need the following things properly installed on your computer.

- [Git](http://git-scm.com/)
- [Node.js](http://nodejs.org/) (with NPM)
- [Bower](http://bower.io/)
- [Ember CLI](http://ember-cli.com/)
- [PhantomJS](http://phantomjs.org/)

#### Running / Development

- `ember server`
- Visit your app at [http://localhost:4200](http://localhost:4200).

#### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

#### Running Tests

- `ember test`
- `ember test --server`

### Linting

- `npm run lint:hbs`
- `npm run lint:js`
- `npm run lint:js -- --fix`

### Building

- `ember build` (development)
- `ember build --environment production` (production)

#### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

- [ember.js](http://emberjs.com/)
- [ember-cli](http://ember-cli.com/)
- Development Browser Extensions
  - [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  - [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
