const { expectRevert } = require('@openzeppelin/test-helpers')

const ZombieFactoryOnChainlink = artifacts.require("ZombieFactoryOnChainlink");  // todo: test final contract
const VRFCoordinatorMock = artifacts.require('VRFCoordinatorMock')
const LinkToken = artifacts.require('LinkToken');

const zombieNames = ["Zombie 1", "Zombie 2"];


contract("ZombieFactoryOnChainlink", (accounts) => {
    let [alice, bob, backend, defaultAccount] = accounts;
    let contractInstance;
    let keyhash, fee, link, vrfCoordinatorMock

    beforeEach(async () => {
        keyhash = '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4'
        fee = '1000000000000000000'
        link = await LinkToken.new({ from: defaultAccount })
        vrfCoordinatorMock = await VRFCoordinatorMock.new(link.address, { from: defaultAccount })

        contractInstance = await ZombieFactoryOnChainlink.new(link.address, keyhash, vrfCoordinatorMock.address, fee, { from: defaultAccount });
    });

    afterEach(async () => {
       await contractInstance.kill({from: defaultAccount});
    });

    it('Should revert without LINK', async () => {
        await expectRevert.unspecified(
            contractInstance.createRandomZombieRequest(zombieNames[0], {from: alice})
        )
    })

    async function _generateRandomZombieWithAsserts(ownerAddress, randomValue) {
        await link.transfer(contractInstance.address, web3.utils.toWei('1', 'ether'), { from: defaultAccount })

        let transaction = await contractInstance.createRandomZombieRequest(zombieNames[0], {from: ownerAddress})
        assert.exists(transaction.receipt.rawLogs)
        const requestId = transaction.logs[0].args.requestId

        transaction = await vrfCoordinatorMock.callBackWithRandomness(requestId, randomValue, contractInstance.address, { from: defaultAccount })
        assert.equal(transaction.receipt.status, true)

        const pastEvents = await contractInstance.getPastEvents('NewZombie',  {fromBlock: 0, toBlock: 'latest'});
        assert.equal(pastEvents[0].args.name, zombieNames[0])
    }

    it('Should generate random zombie', async () => {
        await _generateRandomZombieWithAsserts(alice, '777')
    })

    it('Should not allow to request to generate 2 random zombies for 1 user', async () => {
        await link.transfer(contractInstance.address, web3.utils.toWei('2', 'ether'), { from: defaultAccount })

        let transaction = await contractInstance.createRandomZombieRequest(zombieNames[0], {from: alice})
        assert.exists(transaction.receipt.rawLogs)

        await expectRevert.unspecified(contractInstance.createRandomZombieRequest(zombieNames[0], {from: alice}))
    })

    it('Should allow to create 2 random zombies per 2 users', async () => {
        await _generateRandomZombieWithAsserts(alice, '777')
        await _generateRandomZombieWithAsserts(bob, '771')
        const pastEvents = await contractInstance.getPastEvents('NewZombie',  {fromBlock: 0, toBlock: 'latest'});

        assert.equal(pastEvents.length, 2)
        assert.notEqual(pastEvents[0].returnValues.dna, pastEvents[1].returnValues.dna)
    })

})
