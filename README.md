# Crypto Zombies Project
The project was composed according to cryptoZombie solidity course: https://cryptozombies.io/en/course. 

# Feature
- Chainlink oracles for randomizing
- Tests with mocking Chainlink
- Truffle suite for solidity contract developing
- Auto testing via GitHub Actions
- Docker for contract developing
- may use Kitty Contract to feed zombie. Created zombie by kitty feeding are marked by 99 at the end of DNA
- after action under a zombie there is a cooldown exists (currently I left it equals to 1 min, mb better to 1 day)

# Contract

## Before Start 
- contract owner should define kitty contract address with `setKittyContractAddress` (e.g. for Rinkeby: `0x16baF0dE678E52367adC69fD067E5eDd1D33e3bF`)
- on contract should be enough Link for ChainLink Oracles

# Frontend
I left as simple frontend as possible. Kinda 1 html file.

## Not Implemented
- changeDna method


