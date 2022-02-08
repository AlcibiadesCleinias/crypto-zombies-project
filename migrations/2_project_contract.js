const ProjectContract = artifacts.require("./ProjectContract.sol");

module.exports = function(deployer) {
  deployer.deploy(ProjectContract);
};
