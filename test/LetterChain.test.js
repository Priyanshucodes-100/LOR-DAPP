const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LetterChain", function () {
  let LetterChain, contract, owner, addr1, addr2, addr3;

  const ROLE_NONE = 0;
  const ROLE_SEEKER = 1;
  const ROLE_SPONSOR = 2;
  const ROLE_ADMIN = 3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    LetterChain = await ethers.getContractFactory("LetterChain");
    contract = await LetterChain.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set the deployer as admin", async function () {
      const admin = await contract.admin();
      expect(admin).to.equal(owner.address);
    });

    it("should register admin as the first user", async function () {
      const user = await contract.getUserByAddress(owner.address);
      expect(user.name).to.equal("Admin");
      expect(user.role).to.equal(ROLE_ADMIN);
    });

    it("should have userCount of 1", async function () {
      expect(await contract.userCount()).to.equal(1n);
    });
  });

  describe("User Registration", function () {
    it("should allow a user to register as a seeker", async function () {
      await contract.connect(addr1).registerUser("Alice", "alice@test.com", ROLE_SEEKER);

      const user = await contract.getUserByAddress(addr1.address);
      expect(user.name).to.equal("Alice");
      expect(user.role).to.equal(ROLE_SEEKER);
      expect(user.isActive).to.equal(true);
    });

    it("should allow a user to register as a sponsor", async function () {
      await contract.connect(addr1).registerUser("Dr. Bob", "bob@test.com", ROLE_SPONSOR);

      const user = await contract.getUserByAddress(addr1.address);
      expect(user.name).to.equal("Dr. Bob");
      expect(user.role).to.equal(ROLE_SPONSOR);
    });

    it("should reject registration with ADMIN role from non-admin", async function () {
      await expect(
        contract.connect(addr1).registerUser("Hacker", "hack@test.com", ROLE_ADMIN)
      ).to.be.revertedWith("Register as Seeker or Sponsor");
    });

    it("should reject duplicate registration", async function () {
      await contract.connect(addr1).registerUser("Alice", "alice@test.com", ROLE_SEEKER);
      await expect(
        contract.connect(addr1).registerUser("Alice Again", "alice2@test.com", ROLE_SEEKER)
      ).to.be.revertedWith("Already registered");
    });
  });

  describe("Admin Functions", function () {
    beforeEach(async function () {
      await contract.connect(addr1).registerUser("Alice", "alice@test.com", ROLE_SEEKER);
    });

    it("should allow admin to deactivate a user", async function () {
      await contract.deactivateUser(2);
      const user = await contract.getUserById(2);
      expect(user.isActive).to.equal(false);
    });

    it("should allow admin to reactivate a user", async function () {
      await contract.deactivateUser(2);
      await contract.activateUser(2);
      const user = await contract.getUserById(2);
      expect(user.isActive).to.equal(true);
    });

    it("should reject deactivation from non-admin", async function () {
      await expect(
        contract.connect(addr1).deactivateUser(2)
      ).to.be.revertedWith("Only admin");
    });

    it("should prevent deactivating admin", async function () {
      await expect(
        contract.deactivateUser(1)
      ).to.be.revertedWith("Cannot deactivate admin");
    });
  });

  describe("Letter Flow", function () {
    beforeEach(async function () {
      await contract.connect(addr1).registerUser("Alice", "alice@test.com", ROLE_SEEKER);
      await contract.connect(addr2).registerUser("Dr. Bob", "bob@test.com", ROLE_SPONSOR);
    });

    it("should allow a seeker to request a letter", async function () {
      await contract.connect(addr1).requestLetter(3, "Blockchain Course LOR");

      const l = await contract.getLetter(1);
      expect(l.seekerId).to.equal(2n);
      expect(l.sponsorId).to.equal(3n);
      expect(l.title).to.equal("Blockchain Course LOR");
      expect(l.status).to.equal(0n);
    });

    it("should reject request from unregistered user", async function () {
      await expect(
        contract.connect(addr3).requestLetter(3, "Test")
      ).to.be.revertedWith("Not registered");
    });

    it("should reject request to non-existent sponsor", async function () {
      await expect(
        contract.connect(addr1).requestLetter(99, "Test")
      ).to.be.revertedWith("Sponsor not found");
    });

    it("should allow sponsor to approve a letter", async function () {
      await contract.connect(addr1).requestLetter(3, "Blockchain LOR");
      await contract.connect(addr2).approveLetter(1);

      const l = await contract.getLetter(1);
      expect(l.status).to.equal(1n);
    });

    it("should allow sponsor to reject a letter", async function () {
      await contract.connect(addr1).requestLetter(3, "Blockchain LOR");
      await contract.connect(addr2).rejectLetter(1);

      const l = await contract.getLetter(1);
      expect(l.status).to.equal(2n);
    });

    it("should allow sponsor to submit a letter after approval", async function () {
      await contract.connect(addr1).requestLetter(3, "Blockchain LOR");
      await contract.connect(addr2).approveLetter(1);
      await contract.connect(addr2).submitLetter(1, "QmXyz123...");

      const l = await contract.getLetter(1);
      expect(l.status).to.equal(3n);
      expect(l.ipfsHash).to.equal("QmXyz123...");
    });

    it("should reject submission without approval", async function () {
      await contract.connect(addr1).requestLetter(3, "Blockchain LOR");
      await expect(
        contract.connect(addr2).submitLetter(1, "QmXyz123...")
      ).to.be.revertedWith("Not approved yet");
    });

    it("should reject approval from wrong sponsor", async function () {
      await contract.connect(addr3).registerUser("Dr. Eve", "eve@test.com", ROLE_SPONSOR);
      await contract.connect(addr1).requestLetter(3, "Blockchain LOR");
      await expect(
        contract.connect(addr3).approveLetter(1)
      ).to.be.revertedWith("Not your letter");
    });

    it("should track seeker letters", async function () {
      await contract.connect(addr1).requestLetter(3, "LOR 1");
      await contract.connect(addr1).requestLetter(3, "LOR 2");

      const ls = await contract.getSeekerLetters(2);
      expect(ls.length).to.equal(2);
    });

    it("should track sponsor letters", async function () {
      await contract.connect(addr1).requestLetter(3, "LOR 1");

      const ls = await contract.getSponsorLetters(3);
      expect(ls.length).to.equal(1);
    });
  });

  describe("Verification", function () {
    beforeEach(async function () {
      await contract.connect(addr1).registerUser("Alice", "alice@test.com", ROLE_SEEKER);
      await contract.connect(addr2).registerUser("Dr. Bob", "bob@test.com", ROLE_SPONSOR);
      await contract.connect(addr1).requestLetter(3, "Blockchain LOR");
      await contract.connect(addr2).approveLetter(1);
      await contract.connect(addr2).submitLetter(1, "QmXyz123");
    });

    it("should return correct verification data", async function () {
      const result = await contract.verifyLetter(1);
      expect(result.seekerName).to.equal("Alice");
      expect(result.sponsorName).to.equal("Dr. Bob");
      expect(result.title).to.equal("Blockchain LOR");
      expect(result.ipfsHash).to.equal("QmXyz123");
      expect(result.status).to.equal(3n);
    });
  });

  describe("List All Users", function () {
    beforeEach(async function () {
      await contract.connect(addr1).registerUser("Alice", "alice@test.com", ROLE_SEEKER);
      await contract.connect(addr2).registerUser("Dr. Bob", "bob@test.com", ROLE_SPONSOR);
      await contract.connect(addr3).registerUser("Charlie", "charlie@test.com", ROLE_SEEKER);
    });

    it("should list all seekers", async function () {
      const seekers = await contract.getAllSeekers();
      expect(seekers.length).to.equal(2);
    });

    it("should list all sponsors", async function () {
      const sponsors = await contract.getAllSponsors();
      expect(sponsors.length).to.equal(1);
    });
  });
});
