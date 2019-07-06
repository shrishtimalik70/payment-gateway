const Migrations = artifacts.require("Migrations");
const EcommerceStore=artifacts.require("EcommerceStore");
module.exports = function(deployer) {
  deployer.deploy(Migrations);
 deployer.deploy(EcommerceStore);
};
