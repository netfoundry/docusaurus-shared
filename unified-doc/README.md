# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```


### Kinsta Hosting

As of Sep 2025 - the technical docs have been published to the public folder on kinsta. 
A **CUSTOM** rule was added by tech support:
```
location /docs {
  try_files $uri /docs/index.html;
}
```

This rule is **mandatory** for SPA deep linking. The tech support people had to add it.
