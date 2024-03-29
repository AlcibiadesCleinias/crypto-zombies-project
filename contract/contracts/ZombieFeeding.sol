pragma solidity ^0.6.6;

import "./ZombieFactoryOnChainlink.sol";

interface KittyInterface {
  function getKitty(uint256 _id) external view returns (
    bool isGestating,
    bool isReady,
    uint256 cooldownIndex,
    uint256 nextActionAt,
    uint256 siringWithId,
    uint256 birthTime,
    uint256 matronId,
    uint256 sireId,
    uint256 generation,
    uint256 genes
  );
}

contract ZombieFeeding is ZombieFactoryOnChainlink {

  KittyInterface kittyContract;

  modifier onlyOwnerOf(uint _zombieId) {
    require(msg.sender == zombieToOwner[_zombieId]);
    _;
  }

  /*
  * @dev: Even if no change in parent contract constructor should be repeated.
  */
  constructor(address _linkTokenAddress, bytes32 _keyHash,
    address _vrfCoordinatorAddress, uint256 _fee)
      public
      ZombieFactoryOnChainlink(_linkTokenAddress, _keyHash, _vrfCoordinatorAddress, _fee) {
      // pass
  }

  function setKittyContractAddress(address _address) external onlyOwner {
    kittyContract = KittyInterface(_address);
  }

  function _triggerCooldown(Zombie storage _zombie) internal {
    _zombie.readyTime = uint32(now + cooldownTime);
  }

  function _isReady(Zombie storage _zombie) internal view returns (bool) {
      return (_zombie.readyTime <= now);
  }

  function feedAndMultiply(uint _zombieId, uint _targetDna, address _owner, string memory _species) internal {
    Zombie storage myZombie = zombies[_zombieId];
    require(_isReady(myZombie), "Zombie is not ready for feeding - cooldown.");
    _targetDna = _targetDna % dnaModulus;
    uint newDna = (myZombie.dna + _targetDna) / 2;
    if (keccak256(abi.encodePacked(_species)) == keccak256(abi.encodePacked("kitty"))) {
      newDna = newDna - newDna % 100 + 99;
    }
    _createZombie(_owner, "NoName", newDna);
    _triggerCooldown(myZombie);
  }

  function feedOnKitty(uint _zombieId, uint _kittyId) external onlyOwnerOf(_zombieId) {
    uint kittyDna;
    (,,,,,,,,,kittyDna) = kittyContract.getKitty(_kittyId);
    feedAndMultiply(_zombieId, kittyDna, msg.sender, "kitty");
  }
}
