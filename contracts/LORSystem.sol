pragma solidity ^0.8.20;

contract LORSystem {

    enum Role { NONE, STUDENT, PROFESSOR, ADMIN }

    enum RecommendationStatus { PENDING, APPROVED, REJECTED, SUBMITTED }

    struct User {
        uint id;
        address wallet;
        string name;
        string email;
        Role role;
        bool isActive;
    }

    struct Recommendation {
        uint id;
        uint studentId;
        uint professorId;
        string title;
        string letterIpfsHash;
        RecommendationStatus status;
        uint createdAt;
        uint updatedAt;
    }

    address public admin;
    uint public userCount;
    uint public recommendationCount;

    mapping(uint => User) public users;
    mapping(address => uint) public addressToUserId;
    mapping(uint => Recommendation) public recommendations;
    mapping(uint => uint[]) public studentRecommendations;
    mapping(uint => uint[]) public professorRecommendations;

    event UserRegistered(uint indexed userId, address indexed wallet, string name, Role role);
    event UserDeactivated(uint indexed userId);
    event UserActivated(uint indexed userId);
    event RecommendationRequested(uint indexed recId, uint indexed studentId, uint indexed professorId, string title);
    event RecommendationApproved(uint indexed recId, uint indexed professorId);
    event RecommendationRejected(uint indexed recId, uint indexed professorId);
    event RecommendationSubmitted(uint indexed recId, string ipfsHash);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyRegistered() {
        require(addressToUserId[msg.sender] != 0, "User not registered");
        _;
    }

    modifier onlyRole(Role _role) {
        uint uid = addressToUserId[msg.sender];
        require(uid != 0 && users[uid].role == _role, "Not authorized for this role");
        _;
    }

    modifier studentExists(uint _studentId) {
        require(_studentId > 0 && _studentId <= userCount, "Student does not exist");
        require(users[_studentId].role == Role.STUDENT, "Not a student");
        _;
    }

    modifier professorExists(uint _professorId) {
        require(_professorId > 0 && _professorId <= userCount, "Professor does not exist");
        require(users[_professorId].role == Role.PROFESSOR, "Not a professor");
        _;
    }

    constructor() {
        admin = msg.sender;
        _registerUser(msg.sender, "Admin", "admin@lor-system.com", Role.ADMIN);
    }

    function registerUser(
        string memory _name,
        string memory _email,
        Role _role
    ) public {
        require(_role == Role.STUDENT || _role == Role.PROFESSOR, "Can only register as Student or Professor");
        require(addressToUserId[msg.sender] == 0, "Already registered");
        _registerUser(msg.sender, _name, _email, _role);
    }

    function _registerUser(
        address _wallet,
        string memory _name,
        string memory _email,
        Role _role
    ) internal {
        userCount++;
        users[userCount] = User(userCount, _wallet, _name, _email, _role, true);
        addressToUserId[_wallet] = userCount;
        emit UserRegistered(userCount, _wallet, _name, _role);
    }

    function deactivateUser(uint _userId) public onlyAdmin {
        require(_userId > 0 && _userId <= userCount, "User does not exist");
        require(users[_userId].isActive == true, "User already inactive");
        require(users[_userId].wallet != admin, "Cannot deactivate admin");
        users[_userId].isActive = false;
        emit UserDeactivated(_userId);
    }

    function activateUser(uint _userId) public onlyAdmin {
        require(_userId > 0 && _userId <= userCount, "User does not exist");
        require(users[_userId].isActive == false, "User already active");
        users[_userId].isActive = true;
        emit UserActivated(_userId);
    }

    function requestRecommendation(
        uint _professorId,
        string memory _title
    ) public onlyRegistered onlyRole(Role.STUDENT) professorExists(_professorId) {
        uint studentId = addressToUserId[msg.sender];
        require(users[studentId].isActive, "Student account is deactivated");

        recommendationCount++;
        recommendations[recommendationCount] = Recommendation(
            recommendationCount,
            studentId,
            _professorId,
            _title,
            "",
            RecommendationStatus.PENDING,
            block.timestamp,
            block.timestamp
        );
        studentRecommendations[studentId].push(recommendationCount);
        professorRecommendations[_professorId].push(recommendationCount);

        emit RecommendationRequested(recommendationCount, studentId, _professorId, _title);
    }

    function approveRecommendation(
        uint _recId
    ) public onlyRegistered onlyRole(Role.PROFESSOR) {
        Recommendation storage rec = recommendations[_recId];
        require(rec.id != 0, "Recommendation does not exist");
        require(rec.professorId == addressToUserId[msg.sender], "Not your recommendation");
        require(rec.status == RecommendationStatus.PENDING, "Recommendation not pending");
        require(users[rec.studentId].isActive, "Student account is deactivated");

        rec.status = RecommendationStatus.APPROVED;
        rec.updatedAt = block.timestamp;

        emit RecommendationApproved(_recId, rec.professorId);
    }

    function rejectRecommendation(
        uint _recId
    ) public onlyRegistered onlyRole(Role.PROFESSOR) {
        Recommendation storage rec = recommendations[_recId];
        require(rec.id != 0, "Recommendation does not exist");
        require(rec.professorId == addressToUserId[msg.sender], "Not your recommendation");
        require(rec.status == RecommendationStatus.PENDING, "Recommendation not pending");

        rec.status = RecommendationStatus.REJECTED;
        rec.updatedAt = block.timestamp;

        emit RecommendationRejected(_recId, rec.professorId);
    }

    function submitRecommendation(
        uint _recId,
        string memory _ipfsHash
    ) public onlyRegistered onlyRole(Role.PROFESSOR) {
        Recommendation storage rec = recommendations[_recId];
        require(rec.id != 0, "Recommendation does not exist");
        require(rec.professorId == addressToUserId[msg.sender], "Not your recommendation");
        require(rec.status == RecommendationStatus.APPROVED, "Recommendation not approved");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");

        rec.status = RecommendationStatus.SUBMITTED;
        rec.letterIpfsHash = _ipfsHash;
        rec.updatedAt = block.timestamp;

        emit RecommendationSubmitted(_recId, _ipfsHash);
    }

    function getUserByAddress(
        address _wallet
    ) public view returns (User memory) {
        uint uid = addressToUserId[_wallet];
        require(uid != 0, "User not registered");
        return users[uid];
    }

    function getUserById(
        uint _userId
    ) public view returns (User memory) {
        require(_userId > 0 && _userId <= userCount, "User does not exist");
        return users[_userId];
    }

    function getRecommendation(
        uint _recId
    ) public view returns (Recommendation memory) {
        require(_recId > 0 && _recId <= recommendationCount, "Recommendation does not exist");
        return recommendations[_recId];
    }

    function getStudentRecommendations(
        uint _studentId
    ) public view returns (Recommendation[] memory) {
        uint[] storage recIds = studentRecommendations[_studentId];
        Recommendation[] memory result = new Recommendation[](recIds.length);
        for (uint i = 0; i < recIds.length; i++) {
            result[i] = recommendations[recIds[i]];
        }
        return result;
    }

    function getProfessorRecommendations(
        uint _professorId
    ) public view returns (Recommendation[] memory) {
        uint[] storage recIds = professorRecommendations[_professorId];
        Recommendation[] memory result = new Recommendation[](recIds.length);
        for (uint i = 0; i < recIds.length; i++) {
            result[i] = recommendations[recIds[i]];
        }
        return result;
    }

    function verifyRecommendation(
        uint _recId
    ) public view returns (
        string memory studentName,
        string memory professorName,
        string memory title,
        string memory letterIpfsHash,
        RecommendationStatus status,
        uint createdAt
    ) {
        Recommendation memory rec = getRecommendation(_recId);
        User memory student = users[rec.studentId];
        User memory professor = users[rec.professorId];
        return (
            student.name,
            professor.name,
            rec.title,
            rec.letterIpfsHash,
            rec.status,
            rec.createdAt
        );
    }

    function getAllStudents() public view returns (User[] memory) {
        uint count;
        for (uint i = 1; i <= userCount; i++) {
            if (users[i].role == Role.STUDENT) count++;
        }
        User[] memory result = new User[](count);
        uint index;
        for (uint i = 1; i <= userCount; i++) {
            if (users[i].role == Role.STUDENT) {
                result[index] = users[i];
                index++;
            }
        }
        return result;
    }

    function getAllProfessors() public view returns (User[] memory) {
        uint count;
        for (uint i = 1; i <= userCount; i++) {
            if (users[i].role == Role.PROFESSOR) count++;
        }
        User[] memory result = new User[](count);
        uint index;
        for (uint i = 1; i <= userCount; i++) {
            if (users[i].role == Role.PROFESSOR) {
                result[index] = users[i];
                index++;
            }
        }
        return result;
    }

    function isUserRegistered(address _wallet) public view returns (bool) {
        return addressToUserId[_wallet] != 0;
    }
}
