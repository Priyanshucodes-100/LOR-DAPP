pragma solidity ^0.8.20;

contract LetterChain {

    enum Role { NONE, SEEKER, SPONSOR, ADMIN }

    enum LetterStatus { PENDING, APPROVED, REJECTED, SUBMITTED }

    struct User {
        uint id;
        address wallet;
        string name;
        string email;
        Role role;
        bool isActive;
    }

    struct Letter {
        uint id;
        uint seekerId;
        uint sponsorId;
        string title;
        string ipfsHash;
        LetterStatus status;
        uint createdAt;
        uint updatedAt;
    }

    address public admin;
    uint public userCount;
    uint public letterCount;

    mapping(uint => User) public users;
    mapping(address => uint) public addressToUserId;
    mapping(uint => Letter) public letters;
    mapping(uint => uint[]) public seekerLetters;
    mapping(uint => uint[]) public sponsorLetters;

    event UserRegistered(uint indexed userId, address indexed wallet, string name, Role role);
    event UserDeactivated(uint indexed userId);
    event UserActivated(uint indexed userId);
    event LetterRequested(uint indexed letterId, uint indexed seekerId, uint indexed sponsorId, string title);
    event LetterApproved(uint indexed letterId, uint indexed sponsorId);
    event LetterRejected(uint indexed letterId, uint indexed sponsorId);
    event LetterSubmitted(uint indexed letterId, string ipfsHash);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyRegistered() {
        require(addressToUserId[msg.sender] != 0, "Not registered");
        _;
    }

    modifier onlyRole(Role _role) {
        uint uid = addressToUserId[msg.sender];
        require(uid != 0 && users[uid].role == _role, "Wrong role");
        _;
    }

    modifier seekerExists(uint _seekerId) {
        require(_seekerId > 0 && _seekerId <= userCount, "Seeker not found");
        require(users[_seekerId].role == Role.SEEKER, "Not a seeker");
        _;
    }

    modifier sponsorExists(uint _sponsorId) {
        require(_sponsorId > 0 && _sponsorId <= userCount, "Sponsor not found");
        require(users[_sponsorId].role == Role.SPONSOR, "Not a sponsor");
        _;
    }

    constructor() {
        admin = msg.sender;
        _registerUser(msg.sender, "Admin", "admin@letterchain.io", Role.ADMIN);
    }

    function registerUser(
        string memory _name,
        string memory _email,
        Role _role
    ) public {
        require(_role == Role.SEEKER || _role == Role.SPONSOR, "Register as Seeker or Sponsor");
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
        require(_userId > 0 && _userId <= userCount, "No such user");
        require(users[_userId].isActive == true, "Already inactive");
        require(users[_userId].wallet != admin, "Cannot deactivate admin");
        users[_userId].isActive = false;
        emit UserDeactivated(_userId);
    }

    function activateUser(uint _userId) public onlyAdmin {
        require(_userId > 0 && _userId <= userCount, "No such user");
        require(users[_userId].isActive == false, "Already active");
        users[_userId].isActive = true;
        emit UserActivated(_userId);
    }

    function requestLetter(
        uint _sponsorId,
        string memory _title
    ) public onlyRegistered onlyRole(Role.SEEKER) sponsorExists(_sponsorId) {
        uint seekerId = addressToUserId[msg.sender];
        require(users[seekerId].isActive, "Seeker is deactivated");

        letterCount++;
        letters[letterCount] = Letter(
            letterCount,
            seekerId,
            _sponsorId,
            _title,
            "",
            LetterStatus.PENDING,
            block.timestamp,
            block.timestamp
        );
        seekerLetters[seekerId].push(letterCount);
        sponsorLetters[_sponsorId].push(letterCount);

        emit LetterRequested(letterCount, seekerId, _sponsorId, _title);
    }

    function approveLetter(
        uint _letterId
    ) public onlyRegistered onlyRole(Role.SPONSOR) {
        Letter storage l = letters[_letterId];
        require(l.id != 0, "Letter not found");
        require(l.sponsorId == addressToUserId[msg.sender], "Not your letter");
        require(l.status == LetterStatus.PENDING, "Not pending");
        require(users[l.seekerId].isActive, "Seeker is deactivated");

        l.status = LetterStatus.APPROVED;
        l.updatedAt = block.timestamp;

        emit LetterApproved(_letterId, l.sponsorId);
    }

    function rejectLetter(
        uint _letterId
    ) public onlyRegistered onlyRole(Role.SPONSOR) {
        Letter storage l = letters[_letterId];
        require(l.id != 0, "Letter not found");
        require(l.sponsorId == addressToUserId[msg.sender], "Not your letter");
        require(l.status == LetterStatus.PENDING, "Not pending");

        l.status = LetterStatus.REJECTED;
        l.updatedAt = block.timestamp;

        emit LetterRejected(_letterId, l.sponsorId);
    }

    function submitLetter(
        uint _letterId,
        string memory _ipfsHash
    ) public onlyRegistered onlyRole(Role.SPONSOR) {
        Letter storage l = letters[_letterId];
        require(l.id != 0, "Letter not found");
        require(l.sponsorId == addressToUserId[msg.sender], "Not your letter");
        require(l.status == LetterStatus.APPROVED, "Not approved yet");
        require(bytes(_ipfsHash).length > 0, "Hash cannot be empty");

        l.status = LetterStatus.SUBMITTED;
        l.ipfsHash = _ipfsHash;
        l.updatedAt = block.timestamp;

        emit LetterSubmitted(_letterId, _ipfsHash);
    }

    function getUserByAddress(
        address _wallet
    ) public view returns (User memory) {
        uint uid = addressToUserId[_wallet];
        require(uid != 0, "Not registered");
        return users[uid];
    }

    function getUserById(
        uint _userId
    ) public view returns (User memory) {
        require(_userId > 0 && _userId <= userCount, "No such user");
        return users[_userId];
    }

    function getLetter(
        uint _letterId
    ) public view returns (Letter memory) {
        require(_letterId > 0 && _letterId <= letterCount, "Letter not found");
        return letters[_letterId];
    }

    function getSeekerLetters(
        uint _seekerId
    ) public view returns (Letter[] memory) {
        uint[] storage ids = seekerLetters[_seekerId];
        Letter[] memory result = new Letter[](ids.length);
        for (uint i = 0; i < ids.length; i++) {
            result[i] = letters[ids[i]];
        }
        return result;
    }

    function getSponsorLetters(
        uint _sponsorId
    ) public view returns (Letter[] memory) {
        uint[] storage ids = sponsorLetters[_sponsorId];
        Letter[] memory result = new Letter[](ids.length);
        for (uint i = 0; i < ids.length; i++) {
            result[i] = letters[ids[i]];
        }
        return result;
    }

    function verifyLetter(
        uint _letterId
    ) public view returns (
        string memory seekerName,
        string memory sponsorName,
        string memory title,
        string memory ipfsHash,
        LetterStatus status,
        uint createdAt
    ) {
        Letter memory l = getLetter(_letterId);
        User memory seeker = users[l.seekerId];
        User memory sponsor = users[l.sponsorId];
        return (
            seeker.name,
            sponsor.name,
            l.title,
            l.ipfsHash,
            l.status,
            l.createdAt
        );
    }

    function getAllSeekers() public view returns (User[] memory) {
        uint count;
        for (uint i = 1; i <= userCount; i++) {
            if (users[i].role == Role.SEEKER) count++;
        }
        User[] memory result = new User[](count);
        uint index;
        for (uint i = 1; i <= userCount; i++) {
            if (users[i].role == Role.SEEKER) {
                result[index] = users[i];
                index++;
            }
        }
        return result;
    }

    function getAllSponsors() public view returns (User[] memory) {
        uint count;
        for (uint i = 1; i <= userCount; i++) {
            if (users[i].role == Role.SPONSOR) count++;
        }
        User[] memory result = new User[](count);
        uint index;
        for (uint i = 1; i <= userCount; i++) {
            if (users[i].role == Role.SPONSOR) {
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
