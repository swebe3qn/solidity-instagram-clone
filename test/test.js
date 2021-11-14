const Decentragram = artifacts.require('./Decentragram.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Decentragram', ([deployer, author, tipper]) => {
  let decentragram

  before(async () => {
    decentragram = await Decentragram.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await decentragram.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await decentragram.name()
      assert.equal(name, 'Decentragram')
    })
  })

  describe('images', async() => {
    let result, imageCount;
    let hash = 'abc123';

    before(async() => {
      result = await decentragram.uploadImage(hash, 'Image description', {from: author});
      imageCount = await decentragram.imageCount()
    })

    // it('should create images', async() => {
    //   assert.equal(imageCount, 1, "Image count is not 1");
    //   let {args} = result.logs[0];
    //   assert.equal(args.id.toNumber(), imageCount.toNumber()-1, "Image id is not 1");
    //   assert.equal(args.hash, hash, "Hash is wrong");
    //   assert.equal(args.description, 'Image description', "Image description is wrong");
    //   assert.equal(args.tipAmount.toNumber(), 0, "Tip amount is not 0");
    //   assert.equal(args.author, author, "Wrong author");

    //   await decentragram.uploadImage('', 'Image description', {from: author}).should.be.rejected;
    //   await decentragram.uploadImage(hash, '', {from: author}).should.be.rejected;
    //   await decentragram.uploadImage(hash, 'Image description', {from: '0x0'}).should.be.rejected;
    // })

    it('should be tipable', async() => {
      let resultx = await decentragram.tipImageOwner(imageCount.toNumber()-1, {from: tipper, value: 100});
      let {args} = resultx.logs[0];
      assert.equal(args.id.toNumber(), imageCount.toNumber()-1, "Image id is not correct");
      assert.equal(args.hash, hash, "Hash is wrong"); 
      assert.equal(args.description, 'Image description', "Image description is wrong");
      assert.equal(args.tipAmount.toNumber(), 100, "Tip amount is not 100");
      assert.equal(args.author, author, "Wrong author");
    })
  })
})