pragma solidity ^0.6.6;

/// @title Fake contract to test proj. contract.
contract KittyFake {

  /// @dev Everything we need in our tests: genes
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
  ) {
    return (false, false, 1, 1, 1, 1, 1, 1, 1, 100);
  }
}
