![Housing Passports](https://user-images.githubusercontent.com/1090606/51992204-7e143200-24a4-11e9-9dff-643d72c6865b.png)

# Housing Passports

The Housing Passports project is a collaboration with the World Bank to improve housing resilience.

The WB is interested in detecting specific construction features within geotagged Streetview imagery. Their goal is to find features that are potentially dangerous during earthquakes, high winds, floods, etc. A good example is their initial push in Guatemala where they were looking for "soft story" buildings. These are 2+ level structures that have large windows or garage doors on the ground floor -- the large openings correspond to a high risk that the building will collapse and pancake during earthquakes. Other features could include roof overhangs, building construction material, presence of gutters.

Their hope is to detect dangerous features in Streeview images using ML, reference the image's geotag to get a location, and rely on local groups to deploy fixes or improvements.

## Installation and Usage

The steps below will walk you through setting up your own instance of the project.

### Install Project Dependencies
To set up the development environment for this website, you'll need to install the following on your system:

- [Node](http://nodejs.org/) v8 (To manage multiple node versions we recommend [nvm](https://github.com/creationix/nvm))
- [Yarn](https://yarnpkg.com/) Package manager

### Install Application Dependencies

If you use [`nvm`](https://github.com/creationix/nvm), activate the desired Node version:

```
nvm install
```

Install Node modules:

```
yarn install
```

### Usage

#### Config files
All the config files can be found in `app/assets/scripts/config`.
After installing the projects there will be 3 main files:
  - `local.js` - Used only for local development. On production this file should not exist or be empty.
  - `staging.js`
  - `production.js`

The `production.js` file serves as base and the other 2 will override it as needed:
  - `staging.js` will be loaded whenever the env variable `DS_ENV` is set to staging.
  - `local.js` will be loaded if it exists.

The following options must be set: (The used file will depend on the context):
  - `value` - Description

Example:
```
module.exports = {
  value: 'some-value'
};
```

#### Starting the app

```
yarn serve
```
Compiles the sass files, javascript, and launches the server making the site available at `http://localhost:3000/`
The system will watch files and execute tasks whenever one of them changes.
The site will automatically refresh since it is bundled with livereload.

# Deployment
To prepare the app for deployment run:

```
yarn build
```
or
```
yarn stage
```
This will package the app and place all the contents in the `dist` directory.
The app can then be run by any web server.
