const utils = require("./utils");
const ProjectContract = artifacts.require("ProjectContract");


contract("ProjectContract", (accounts) => {
    let [alice, bob, backend] = accounts;
    let contractInstance;

    beforeEach(async () => {
        contractInstance = await ProjectContract.new({from: backend});
    });
    // afterEach(async () => {
    //    await contractInstance.kill(); if implemented in ProjectContract
    // });

    context("Primitive checks", async () => {
        it("Assert equal", async () => {
            assert.equal(1,1)
        })
    })
})
