# solidity-on-truffle-template
Template project to start coding on Solidity with all features of Truffle (compile, test, deploy) and inside Docker container.

# Agenda
* [Agenda](#agenda)
* [Feature](#feature)
* [Requirement](#requirement)
* [Docker](#docker)
   * [Build:](#build)
   * [Run &amp; Connect:](#run--connect)
* [Truffle](#truffle)
   * [Env](#env)
   * [Commands](#commands)
* [ToDo](#todo)

# Feature
- Solidity
- CI (GitHub Actions): run autotesting with on PR (check [.github/workflows/ci.yml](.github/workflows/ci.yml))
- Docker (develop inside docker with volume mount)
- Truffle Suit: compile, test, migrate your code
- Example with ready to deploy on **rinkeby** test net  

# Requirement
- Docker (currently not m1)
- Infura key (we use HDProvider) for our Web3 instance
- private key with eth (for migration on rinkeby)

# Docker
In repo I present Dockerfile with truffle instilled, in order to compile, 
run tests and etc with truffle. I suppose you will use **Run & Connect** bash-interactive-docker mode.

## Build:
```bash
docker build -t truffle-sol-dev -f Dockerfile .
```

## Run & Connect:
```bash
docker run --rm -v $(pwd):/opt -it --entrypoint bash truffle-sol-dev
```
Now you are ready to develop project and use truffle (compile, test, deploy), npm.

# Truffle
Truffle helps you to test and migrate with 1 command to declared networks 

> for declared networks check [truffle-config.js](truffle-config.js)

## Env
Prepare `.env` file as it in [.env.example](.env.example). This env will be loaded with dotenv in [truffle-config.js](truffle-config.js) on each run of truffle command.

## Commands
To compile json files from contracts to [build](build) directory
```bash
truffle compile
```

To deploy contract on rinkeby
> for deploy params (i.e. construct params check [migrations/2_project_contract.js](migrations/2_project_contract.js))
```bash
truffle migrate --network rinkeby
```
> there is usefull argument exist if you contract if not recompiled: `--reset`

To test on local truffle chain
```bash
truffle test
```

# ToDo
- [ ] mb better to use Dockerfile in CI rather than node last node image in github action
