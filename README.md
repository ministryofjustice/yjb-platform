# YJB Platform

A monorepo to contain applications running  the new Youth Justice Platform.

## Steps to run the apps

### Prerequisites

- Node 26, recommended install `nvm` via `brew`
  
  ```sh
  brew install nvm
  ```

  Then add to your `~/.zshrc`:

  ```sh
  export NVM_DIR="~/.nvm"
  [ -s "$(brew --prefix nvm)/nvm.sh" ] && . "$(brew --prefix nvm)/nvm.sh"
  ```

  Then call

  ```sh
  nvm install 26
  ```

- [Docker Engine](https://www.docker.com/products/docker-desktop/)

- An `.env` file:

  ```sh
  touch .env
  ```

### To run the applications in Docker

1. `npm install`
1. `docker compose up --build -d` to build the applications then spin them up in detached state

Then your applications are available on <http://localhost:3000> for the UI and <http://localhost:3001> for the API.

Running <http://localhost:3000/api-test-proxy> will confirm that the UI is able to connect to the API server and should return a JSON object.
