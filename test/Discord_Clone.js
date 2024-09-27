const { expect } = require("chai")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("discord_Clone", function () {

  let discord;

  beforeEach(async () => {
    const Discord = await ethers.getContractFactory("discord_Clone");
    discord = await Discord.deploy("Discord", "DS");
  })


  describe("Deployment", function () {

    it("sets the name & symbol", async () => {
      let result = await discord.name();
      expect(result).to.equal("Discord")

      result = await discord.symbol("DS");
      expect(result).to.equal("DS")
    })

  })

})