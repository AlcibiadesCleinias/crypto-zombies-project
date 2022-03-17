pragma solidity ^0.6.6;

import "./ZombieHelper.sol";

contract ZombieAttack is ZombieHelper {
  uint256 attackVictoryProbability = 70;

  event CreateAttackZombieRequest(bytes32 requestId, uint256 zombieId, uint256 targetId);
  event ZombieAttackWin(uint256 zombieId, uint256 targetId, bool isWin);
  event Test(uint256 _ttt);

  struct ZombiesAttackAction {
    uint256 zombieId;
    uint256 targetId;
  }

  /// @dev To determine rather an attack or simple random zombie mint
  mapping (bytes32 => address) private requestIdOfZombiesInAttackActionToAddress;
  mapping (address => ZombiesAttackAction) private addressToZombiesAttackAction;

  /*
  * @dev: Even if no change in parent contract constructor should be repeated.
  */
  constructor(address _linkTokenAddress, bytes32 _keyHash,
    address _vrfCoordinatorAddress, uint256 _fee)
      public
      ZombieHelper(_linkTokenAddress, _keyHash, _vrfCoordinatorAddress, _fee) {
      // pass
  }

  function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
    address _addressOfZombiesInAttackAction = requestIdOfZombiesInAttackActionToAddress[requestId];
    if (_addressOfZombiesInAttackAction == address(0)) {
      super.fulfillRandomness(requestId, randomness);
    } else {
      ZombiesAttackAction memory zombiesAttackAction = addressToZombiesAttackAction[_addressOfZombiesInAttackAction];

      Zombie storage myZombie = zombies[zombiesAttackAction.zombieId];
      Zombie storage enemyZombie = zombies[zombiesAttackAction.targetId];
      emit Test(101);

      bool _isWin = (randomness % 100) >= attackVictoryProbability;
      if (_isWin) {
        myZombie.winCount = myZombie.winCount.add(1);
        myZombie.level = myZombie.level.add(1);
        enemyZombie.lossCount = enemyZombie.lossCount.add(1);
        feedAndMultiply(zombiesAttackAction.zombieId, enemyZombie.dna, _addressOfZombiesInAttackAction, "zombie");
      } else {
        myZombie.lossCount = myZombie.lossCount.add(1);
        enemyZombie.winCount = enemyZombie.winCount.add(1);
        _triggerCooldown(myZombie);
      }
      delete addressToZombiesAttackAction[_addressOfZombiesInAttackAction];
      delete requestIdOfZombiesInAttackActionToAddress[requestId];
      emit ZombieAttackWin(zombiesAttackAction.zombieId, zombiesAttackAction.targetId, _isWin);
    }
  }

  function createAttackZombieRequest(uint256 _zombieId, uint256 _targetId) external onlyOwnerOf(_zombieId) {
    require(addressToZombiesAttackAction[msg.sender].targetId == 0, "Only 1 request to attack may exist");
    Zombie storage myZombie = zombies[_zombieId];
    require(_isReady(myZombie), "Zombie is not ready to fight - cooldown.");
    bytes32 _requestId = super.createRandomnessRequest();
    requestIdOfZombiesInAttackActionToAddress[_requestId] = msg.sender;
    addressToZombiesAttackAction[msg.sender] = ZombiesAttackAction(_zombieId, _targetId);
    emit CreateAttackZombieRequest(_requestId, _zombieId, _targetId);
  }
}
