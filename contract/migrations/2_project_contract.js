const ZombieFactory = artifacts.require("./ZombieAttack.sol");

module.exports = function(deployer, network) {
  if (!network.startsWith('rinkeby')) {
        console.log("Migration only for Rinkeby right now!")
    } else {
        const KEYHASH = '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311'
        const FEE = '100000000000000000'
        const LINK_TOKEN = '0x01BE23585060835E02B77ef475b0Cc51aA1e0709'
        const VRF_COORDINATOR = '0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B'
        deployer.deploy(ZombieFactory, LINK_TOKEN, KEYHASH, VRF_COORDINATOR, FEE)
    }
};

// 0x01BE23585060835E02B77ef475b0Cc51aA1e0709, 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311, 0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B, 100000000000000000
