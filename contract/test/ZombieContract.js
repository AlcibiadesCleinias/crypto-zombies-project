const { expectRevert } = require('@openzeppelin/test-helpers')
const time = require("./utils/time");

const ZombieContract = artifacts.require("ZombieOwnership");
const VRFCoordinatorMock = artifacts.require('VRFCoordinatorMock')
const LinkToken = artifacts.require('LinkToken');
const KittyFake = artifacts.require('KittyFake');

const zombieNames = ["Zombie 1", "Zombie 2"];

const zombieOnKittyDnaIndicator = 99;


contract("ZombieContract", (accounts) => {
    let [alice, bob, backend, defaultAccount] = accounts;
    let contractInstance;
    let keyhash, fee, link, vrfCoordinatorMock

    beforeEach(async () => {
        keyhash = '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4'
        fee = '1000000000000000000'
        link = await LinkToken.new({ from: defaultAccount })
        vrfCoordinatorMock = await VRFCoordinatorMock.new(link.address, { from: defaultAccount })

        contractInstance = await ZombieContract.new(link.address, keyhash, vrfCoordinatorMock.address, fee, { from: defaultAccount });
    });

    afterEach(async () => {
       await contractInstance.kill({from: defaultAccount});
    });

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

    context("Utils checks", async () => {
        it('Should revert without LINK', async () => {
            await expectRevert.unspecified(
                contractInstance.createRandomZombieRequest(zombieNames[0], {from: alice})
            )
        })
    })

    context("Checks for ZombieFactoryOnChainlink part", async () => {
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

    context("Checks for ZombieFeeding part", async () => {

        xit('Should not allow to feed on kitty not from owner', async () => {})
        xit('Should not allow set kitty address not by a contract owner', async () => {})

        it('Should allow to feed on kitty from owner', async () => {
            await _generateRandomZombieWithAsserts(alice, '777')
            let pastEvents = await contractInstance.getPastEvents('NewZombie',  {fromBlock: 0, toBlock: 'latest'});
            const createdZombieId = pastEvents[0].returnValues.zombieId

            const kittyFakeInstance = await KittyFake.new({ from: defaultAccount });
            let transaction = await contractInstance.setKittyContractAddress(kittyFakeInstance.address, {from: defaultAccount})
            assert.equal(transaction.receipt.status, true, "Kitty contract address should be set from backend")

            await time.increase(time.duration.days(1));
            transaction = await contractInstance.feedOnKitty(createdZombieId, 9, {from: alice })
            assert.equal(transaction.receipt.status, true)

            pastEvents = await contractInstance.getPastEvents('NewZombie',  {fromBlock: 0, toBlock: 'latest'});
            const zombieFeededOnKittyDna = pastEvents[pastEvents.length - 1].returnValues.dna
            assert.equal(
                zombieFeededOnKittyDna % 100,
                zombieOnKittyDnaIndicator,
                "Last digits of dna for feeded on kitty should be 99"
            )
        })

        xit('Should not allow to feed on kitty twice for 1 zombie', async () => {
            // todo
        })
    })

    context("Checks for ZombieHelper part", async () => {
        it('Should return all zombies per user', async () => {
            await _generateRandomZombieWithAsserts(alice, '777')
            await _generateRandomZombieWithAsserts(bob, '771')
            let pastEvents = await contractInstance.getPastEvents('NewZombie',  {fromBlock: 0, toBlock: 'latest'});
            const zombieIdOfAlice = pastEvents[0].returnValues.zombieId
            const zombieIdOfBob = pastEvents[1].returnValues.zombieId

            const aliceZombies = await contractInstance.getZombiesByOwner(alice, {from: bob})
            const bobZombies = await contractInstance.getZombiesByOwner(bob, {from: bob})

            assert.equal(aliceZombies.length, 1)
            assert.equal(bobZombies.length, 1)
            assert.equal(aliceZombies[0].words[0], zombieIdOfAlice)
            assert.equal(bobZombies[0].words[0], zombieIdOfBob)
        })
    })

    async function _aliceZombieAttacksBobZombieWithAsserts(winProbability) {
        await link.transfer(contractInstance.address, web3.utils.toWei('1', 'ether'), { from: defaultAccount })

        await _generateRandomZombieWithAsserts(alice, '777')
        await _generateRandomZombieWithAsserts(bob, '771')
        let pastEvents = await contractInstance.getPastEvents('NewZombie',  {fromBlock: 0, toBlock: 'latest'});
        const zombieIdOfAlice = pastEvents[0].returnValues.zombieId
        const zombieIdOfBob = pastEvents[1].returnValues.zombieId

        await time.increase(time.duration.days(1));
        let transaction = await contractInstance.createAttackZombieRequest(zombieIdOfAlice, zombieIdOfBob, {from: alice})
        assert.exists(transaction.receipt.rawLogs)
        const requestId = transaction.logs[0].args.requestId

        transaction = await vrfCoordinatorMock.callBackWithRandomness(requestId, winProbability, contractInstance.address, { from: defaultAccount })
        assert.equal(transaction.receipt.status, true)
    }

    context("Checks for ZombieAttack part", async () => {
        it('It should win with 71 percent and create a new zombie', async () => {
            await _aliceZombieAttacksBobZombieWithAsserts('71')

            let pastEvents = await contractInstance.getPastEvents('ZombieAttackWin',  {fromBlock: 0, toBlock: 'latest'});
            assert.equal(pastEvents.length, 1)
            assert.equal(pastEvents[0].returnValues.isWin, true)


            pastEvents = await contractInstance.getPastEvents('NewZombie',  {fromBlock: 0, toBlock: 'latest'});
            assert.equal(pastEvents.length, 3)
            assert.equal(pastEvents[2].args.name, 'NoName')

            const aliceZombies = await contractInstance.getZombiesByOwner(alice, {from: bob})
            const bobZombies = await contractInstance.getZombiesByOwner(bob, {from: bob})

            assert.equal(bobZombies.length, 1)
            assert.equal(aliceZombies.length, 2)
        })

        it('It should not win with less than 70 percent', async () => {
            await _aliceZombieAttacksBobZombieWithAsserts('69')

            let pastEvents = await contractInstance.getPastEvents('ZombieAttackWin',  {fromBlock: 0, toBlock: 'latest'});
            assert.equal(pastEvents.length, 1)
            assert.equal(pastEvents[0].returnValues.isWin, false)

            const aliceZombies = await contractInstance.getZombiesByOwner(alice, {from: bob})
            const bobZombies = await contractInstance.getZombiesByOwner(bob, {from: bob})

            assert.equal(bobZombies.length, 1)
            assert.equal(aliceZombies.length, 1)
        })

        it('It should throw if zombie is not ready', async () => {
            await link.transfer(contractInstance.address, web3.utils.toWei('1', 'ether'), { from: defaultAccount })

            await _generateRandomZombieWithAsserts(alice, '777')
            await _generateRandomZombieWithAsserts(bob, '771')
            let pastEvents = await contractInstance.getPastEvents('NewZombie',  {fromBlock: 0, toBlock: 'latest'});
            const zombieIdOfAlice = pastEvents[0].returnValues.zombieId
            const zombieIdOfBob = pastEvents[1].returnValues.zombieId

            await expectRevert.unspecified(contractInstance.createAttackZombieRequest(zombieIdOfAlice, zombieIdOfBob, {from: alice}))
        })
    })

    context("Checks for ZombieOwnership part [todo]", async () => {
        // todo
    })
})
