const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LORSystem", function () {
  let LORSystem, contract, owner, addr1, addr2, addr3;

  const ROLE_NONE = 0;
  const ROLE_STUDENT = 1;
  const ROLE_PROFESSOR = 2;
  const ROLE_ADMIN = 3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    LORSystem = await ethers.getContractFactory("LORSystem");
    contract = await LORSystem.deploy();
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
    it("should allow a user to register as a student", async function () {
      await contract.connect(addr1).registerUser("Alice", "alice@test.com", ROLE_STUDENT);

      const user = await contract.getUserByAddress(addr1.address);
      expect(user.name).to.equal("Alice");
      expect(user.role).to.equal(ROLE_STUDENT);
      expect(user.isActive).to.equal(true);
    });

    it("should allow a user to register as a professor", async function () {
      await contract.connect(addr1).registerUser("Dr. Bob", "bob@test.com", ROLE_PROFESSOR);

      const user = await contract.getUserByAddress(addr1.address);
      expect(user.name).to.equal("Dr. Bob");
      expect(user.role).to.equal(ROLE_PROFESSOR);
    });

    it("should reject registration with ADMIN role from non-admin", async function () {
      await expect(
        contract.connect(addr1).registerUser("Hacker", "hack@test.com", ROLE_ADMIN)
      ).to.be.revertedWith("Can only register as Student or Professor");
    });

    it("should reject duplicate registration", async function () {
      await contract.connect(addr1).registerUser("Alice", "alice@test.com", ROLE_STUDENT);
      await expect(
        contract.connect(addr1).registerUser("Alice Again", "alice2@test.com", ROLE_STUDENT)
      ).to.be.revertedWith("Already registered");
    });
  });

  describe("Admin Functions", function () {
    beforeEach(async function () {
      await contract.connect(addr1).registerUser("Alice", "alice@test.com", ROLE_STUDENT);
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
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("should prevent deactivating admin", async function () {
      await expect(
        contract.deactivateUser(1)
      ).to.be.revertedWith("Cannot deactivate admin");
    });
  });

  describe("Recommendation Flow", function () {
    beforeEach(async function () {
      await contract.connect(addr1).registerUser("Alice", "alice@test.com", ROLE_STUDENT);
      await contract.connect(addr2).registerUser("Dr. Bob", "bob@test.com", ROLE_PROFESSOR);
    });

    it("should allow a student to request a recommendation", async function () {
      await contract.connect(addr1).requestRecommendation(3, "Blockchain Course LOR");

      const rec = await contract.getRecommendation(1);
      expect(rec.studentId).to.equal(2n);
      expect(rec.professorId).to.equal(3n);
      expect(rec.title).to.equal("Blockchain Course LOR");
      expect(rec.status).to.equal(0n);
    });

    it("should reject request from unregistered user", async function () {
      await expect(
        contract.connect(addr3).requestRecommendation(3, "Test")
      ).to.be.revertedWith("User not registered");
    });

    it("should reject request to non-existent professor", async function () {
      await expect(
        contract.connect(addr1).requestRecommendation(99, "Test")
      ).to.be.revertedWith("Professor does not exist");
    });

    it("should allow professor to approve a recommendation", async function () {
      await contract.connect(addr1).requestRecommendation(3, "Blockchain LOR");
      await contract.connect(addr2).approveRecommendation(1);

      const rec = await contract.getRecommendation(1);
      expect(rec.status).to.equal(1n);
    });

    it("should allow professor to reject a recommendation", async function () {
      await contract.connect(addr1).requestRecommendation(3, "Blockchain LOR");
      await contract.connect(addr2).rejectRecommendation(1);

      const rec = await contract.getRecommendation(1);
      expect(rec.status).to.equal(2n);
    });

    it("should allow professor to submit a recommendation after approval", async function () {
      await contract.connect(addr1).requestRecommendation(3, "Blockchain LOR");
      await contract.connect(addr2).approveRecommendation(1);
      await contract.connect(addr2).submitRecommendation(1, "QmXyz123...");

      const rec = await contract.getRecommendation(1);
      expect(rec.status).to.equal(3n);
      expect(rec.letterIpfsHash).to.equal("QmXyz123...");
    });

    it("should reject submission without approval", async function () {
      await contract.connect(addr1).requestRecommendation(3, "Blockchain LOR");
      await expect(
        contract.connect(addr2).submitRecommendation(1, "QmXyz123...")
      ).to.be.revertedWith("Recommendation not approved");
    });

    it("should reject approval from wrong professor", async function () {
      await contract.connect(addr3).registerUser("Dr. Eve", "eve@test.com", ROLE_PROFESSOR);
      await contract.connect(addr1).requestRecommendation(3, "Blockchain LOR");
      await expect(
        contract.connect(addr3).approveRecommendation(1)
      ).to.be.revertedWith("Not your recommendation");
    });

    it("should track student recommendations", async function () {
      await contract.connect(addr1).requestRecommendation(3, "LOR 1");
      await contract.connect(addr1).requestRecommendation(3, "LOR 2");

      const recs = await contract.getStudentRecommendations(2);
      expect(recs.length).to.equal(2);
    });

    it("should track professor recommendations", async function () {
      await contract.connect(addr1).requestRecommendation(3, "LOR 1");

      const recs = await contract.getProfessorRecommendations(3);
      expect(recs.length).to.equal(1);
    });
  });

  describe("Verification", function () {
    beforeEach(async function () {
      await contract.connect(addr1).registerUser("Alice", "alice@test.com", ROLE_STUDENT);
      await contract.connect(addr2).registerUser("Dr. Bob", "bob@test.com", ROLE_PROFESSOR);
      await contract.connect(addr1).requestRecommendation(3, "Blockchain LOR");
      await contract.connect(addr2).approveRecommendation(1);
      await contract.connect(addr2).submitRecommendation(1, "QmXyz123");
    });

    it("should return correct verification data", async function () {
      const result = await contract.verifyRecommendation(1);
      expect(result.studentName).to.equal("Alice");
      expect(result.professorName).to.equal("Dr. Bob");
      expect(result.title).to.equal("Blockchain LOR");
      expect(result.letterIpfsHash).to.equal("QmXyz123");
      expect(result.status).to.equal(3n);
    });
  });

  describe("List All Users", function () {
    beforeEach(async function () {
      await contract.connect(addr1).registerUser("Alice", "alice@test.com", ROLE_STUDENT);
      await contract.connect(addr2).registerUser("Dr. Bob", "bob@test.com", ROLE_PROFESSOR);
      await contract.connect(addr3).registerUser("Charlie", "charlie@test.com", ROLE_STUDENT);
    });

    it("should list all students", async function () {
      const students = await contract.getAllStudents();
      expect(students.length).to.equal(2);
    });

    it("should list all professors", async function () {
      const professors = await contract.getAllProfessors();
      expect(professors.length).to.equal(1);
    });
  });
});
