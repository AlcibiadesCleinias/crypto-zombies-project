# Crypto Zombies Project
The project was composed according to cryptoZombie solidity course: https://cryptozombies.io/en/course.
In contrary to course code all code in this repo is without syntax errors, workable and even covered with working tests and frontend.

# Prod
Check out the game: https://alcibiadescleinias.github.io/crypto-zombies-project/frontend/index.html

# Feature
- ChainLink oracles for randomizing: random zombie creation, random zombie fighting
- Tests, tests, tests even with mocking ChainLink oracles
- Truffle suite for solidity contract developing
- Auto testing via GitHub Actions
- Docker for contract developing
- May use Kitty Contract to feed zombie. Created zombie by kitty feeding are marked by 99 at the end of DNA
- After action under a zombie there is a cooldown exists (currently I left it equals to 1 min, mb better to 1 day)
- Basic Erc721 features (on frontend only transfer is accessible, but in contract there is even more)

# Contract

## Before Start 
- contract owner should define kitty contract address with `setKittyContractAddress` (e.g. for Rinkeby: `0x16baF0dE678E52367adC69fD067E5eDd1D33e3bF`)
- on contract should be enough Link for ChainLink Oracles [how to get test LINK](https://docs.chain.link/docs/acquire-link/)

# Frontend
I left as simple frontend as possible. Kinda 1 html file.

## Start
`npm start`

## Not Implemented
- changeDna method
- subscription on fight win event 
(user creates a request for fight to oracles -> oracles produces random and complete fight -> user should be notified)

# ToDo
- mechanics about level, dna, win/loss counters and how these stats influences on fight and etc. 
- and more, more


