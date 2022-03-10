// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";
import "@chainlink/contracts/src/v0.6/vendor/SafeMathChainlink.sol";

import "./Ownable.sol";
import "./SafeMathCustom.sol";


/**
* @title Contract to create a random zombie with Chainlink random.
* @dev There are 2 steps/methods:
* @dev 1. createRandomZombieRequest - to request ChainLink for randomness
* @dev this method also stops user from
* @dev 2. fulfillRandomness - chainlink push its random and thus mint zombie, event emitted
*/
contract ZombieFactoryOnChainlink is Ownable, VRFConsumerBase {

  using SafeMathChainlink for uint256;
  using SafeMath32Custom for uint32;
  using SafeMath16Custom for uint16;

  event NewZombie(uint zombieId, string name, uint dna);
  event CreateRandomZombieRequest(bytes32 requestId, string zombieName);

  bytes32 public keyHash;
  uint256 public fee;

  uint dnaDigits = 16;
  uint dnaModulus = 10 ** dnaDigits;
  uint cooldownTime = 1 days;

  struct Zombie {
    string name;
    uint dna;
    uint32 level;
    uint32 readyTime;
    uint16 winCount;
    uint16 lossCount;
  }

  Zombie[] public zombies;

  mapping (uint => address) public zombieToOwner;
  mapping (address => uint) ownerZombieCount;

  /**
  * Constructor inherits VRFConsumerBase
  *
  * Network: Rinkeby
  * Chainlink VRF Coordinator address: 0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B
  * LINK token address:                0x01BE23585060835E02B77ef475b0Cc51aA1e0709
  * Key Hash: 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311
  * Fee: 100000000000000000
  */
  constructor(address _linkTokenAddress, bytes32 _keyHash,
    address _vrfCoordinatorAddress, uint256 _fee)
        public
        VRFConsumerBase(
            _vrfCoordinatorAddress, // VRF Coordinator
            _linkTokenAddress  // LINK Token
        )
    {
        keyHash = _keyHash;
        fee = _fee;
    }

  function _createZombie(address _zombieOwner, string memory _zombieName, uint _dna) internal {
    zombies.push(Zombie(_zombieName, _dna, 1, uint32(now + cooldownTime), 0, 0));
    uint id = zombies.length - 1;
    zombieToOwner[id] = _zombieOwner;
    ownerZombieCount[_zombieOwner] = ownerZombieCount[_zombieOwner].add(1);
    emit NewZombie(id, _zombieName, _dna);
  }

  mapping(bytes32 => address) public requestIdToAddress;
  /// @dev By below we also track an initiated request of zombie creation.
  mapping(address => string) private addressToRandomZombieNameRequested;

  /// @dev The first part of random zombie creation.
  function createRandomZombieRequest(string memory _zombieName) public {
    require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
    require(ownerZombieCount[msg.sender] == 0, "Only one first zombie could be requested to create with this method.");
    require(bytes(addressToRandomZombieNameRequested[msg.sender]).length == 0, "Only 1 request to create a random zombie may exist");
    bytes32 _requestId =  requestRandomness(keyHash, fee);
    requestIdToAddress[_requestId] = msg.sender;
    addressToRandomZombieNameRequested[msg.sender] = _zombieName;
    emit CreateRandomZombieRequest(_requestId, _zombieName);
  }

  function _generateRandomDna(string memory _str, uint _uint) private view returns (uint) {
    uint rand = uint(keccak256(abi.encode(_str, _uint)));
    return rand % dnaModulus;
  }

  /// @dev The second part of random zombie creation: Chainlink oracle calls it.
  function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
    address requestAddress = requestIdToAddress[requestId];
    string memory zombieName = addressToRandomZombieNameRequested[requestAddress];
    uint randDna = _generateRandomDna(zombieName, randomness);
    randDna = randDna - randDna % 100;
    _createZombie(requestAddress, zombieName, randDna);
  }

  function kill() public onlyOwner {
    selfdestruct(msg.sender);
  }

}
