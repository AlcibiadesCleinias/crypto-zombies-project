pragma solidity ^0.6.6;

import "./ZombieAttack.sol";
import "./Erc721.sol";
import "@chainlink/contracts/src/v0.6/vendor/SafeMathChainlink.sol";

contract ZombieOwnership is ZombieAttack, Erc721 {

  using SafeMathChainlink for uint256;

  mapping (uint => address) zombieApprovals;

  /*
  * @dev: Even if no change in parent contract constructor should be repeated.
  */
  constructor(address _linkTokenAddress, bytes32 _keyHash,
    address _vrfCoordinatorAddress, uint256 _fee)
      public
      ZombieAttack(_linkTokenAddress, _keyHash, _vrfCoordinatorAddress, _fee) {
      // pass
  }

  function balanceOf(address _owner) external override view returns (uint256) {
    return ownerZombieCount[_owner];
  }

  function ownerOf(uint256 _tokenId) external override view returns (address) {
    return zombieToOwner[_tokenId];
  }

  function _transfer(address _from, address _to, uint256 _tokenId) private {
    ownerZombieCount[_to] = ownerZombieCount[_to].add(1);
    ownerZombieCount[msg.sender] = ownerZombieCount[msg.sender].sub(1);
    zombieToOwner[_tokenId] = _to;
    emit Transfer(_from, _to, _tokenId);
  }

  function transferFrom(address _from, address _to, uint256 _tokenId) external override payable {
      require(zombieToOwner[_tokenId] == msg.sender || zombieApprovals[_tokenId] == msg.sender);
      _transfer(_from, _to, _tokenId);
    }

  function approve(address _approved, uint256 _tokenId) external override payable onlyOwnerOf(_tokenId) {
      zombieApprovals[_tokenId] = _approved;
      emit Approval(msg.sender, _approved, _tokenId);
    }

}
