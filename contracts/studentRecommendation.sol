// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract StudentRecommendation {

    address public owner;

    struct Student {
        uint studentId;
        string name;
        string course;
        string email;
        bool requested;
        bool approved;
    }

    mapping(uint => Student) public students;
    mapping(address => bool) public approvers;

    uint public studentCount;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyApprover() {
        require(approvers[msg.sender] == true, "Not authorized approver");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function authorizeApprover(address _approver) public onlyOwner {
        approvers[_approver] = true;
    }

    function deauthorizeApprover(address _approver) public onlyOwner {
        approvers[_approver] = false;
    }

    function addStudent(
        string memory _name,
        string memory _course,
        string memory _email
    ) public {

        studentCount++;

        students[studentCount] = Student(
            studentCount,
            _name,
            _course,
            _email,
            false,
            false
        );
    }

    function requestRecommendation(uint _studentId) public {

        require(_studentId > 0 && _studentId <= studentCount, "Invalid student ID");

        students[_studentId].requested = true;
    }

    function approveRecommendation(uint _studentId) public onlyApprover {

        require(_studentId > 0 && _studentId <= studentCount, "Invalid student ID");
        require(students[_studentId].requested == true, "Recommendation not requested");

        students[_studentId].approved = true;
    }

    function getStudent(uint _studentId) public view returns (
        uint,
        string memory,
        string memory,
        string memory,
        bool,
        bool
    ) {

        Student memory s = students[_studentId];

        return (
            s.studentId,
            s.name,
            s.course,
            s.email,
            s.requested,
            s.approved
        );
    }
}