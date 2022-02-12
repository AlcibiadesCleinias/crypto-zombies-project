// Convenience script
// installed HDWalletProvider, Web3

(async () => {
    const HDWalletProvider = require('@truffle/hdwallet-provider');
    const Web3 = require('web3')
    require('dotenv').config();

    const privateKey = process.env.PRIVATE_KEY || 'foo';
    const infuraKey = process.env.INFURA_KEY || 'foo';

    const maker = new HDWalletProvider(privateKey, "https://rinkeby.infura.io/v3/" + infuraKey);
    const web3 = new Web3(maker);

    const userAddress = (await web3.eth.getAccounts())[0]
    console.log(userAddress)
    const balance = web3.utils.fromWei(await web3.eth.getBalance(userAddress))
    console.log(balance)

    // test with sender
    const contractAbi = [ { "inputs": [ { "internalType": "address", "name": "_linkTokenAddress", "type": "address" }, { "internalType": "bytes32", "name": "_keyHash", "type": "bytes32" }, { "internalType": "address", "name": "_vrfCoordinatorAddress", "type": "address" }, { "internalType": "uint256", "name": "_fee", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "requestId", "type": "bytes32" }, { "indexed": false, "internalType": "string", "name": "zombieName", "type": "string" } ], "name": "CreateRandomZombieRequest", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "zombieId", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "name", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "dna", "type": "uint256" } ], "name": "NewZombie", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "inputs": [], "name": "fee", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "isOwner", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "keyHash", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [ { "internalType": "bytes32", "name": "requestId", "type": "bytes32" }, { "internalType": "uint256", "name": "randomness", "type": "uint256" } ], "name": "rawFulfillRandomness", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "name": "requestIdToAddress", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "zombieToOwner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "zombies", "outputs": [ { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "uint256", "name": "dna", "type": "uint256" }, { "internalType": "uint32", "name": "level", "type": "uint32" }, { "internalType": "uint32", "name": "readyTime", "type": "uint32" }, { "internalType": "uint16", "name": "winCount", "type": "uint16" }, { "internalType": "uint16", "name": "lossCount", "type": "uint16" } ], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [ { "internalType": "string", "name": "_zombieName", "type": "string" } ], "name": "createRandomZombieRequest", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ]
    const contractAddress = '0x20f8042991214C0a0241c99491fCA501B0355fdd'

    const contractInstance = new web3.eth.Contract(
          contractAbi,
          contractAddress
    );

    const pastEvents = await contractInstance.getPastEvents('NewZombie',  {fromBlock: 0, toBlock: 'latest'});
    console.log(pastEvents)

    return null
})()
