// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LoR {

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    struct Student {
        uint id;
        string name;
        string course;
        string email;
        bool recommendationRequested;
        bool recommendationApproved;
    }

    mapping(uint => Student) public students;
    mapping(address => bool) public approvers;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyApprover() {
        require(approvers[msg.sender], "Not authorized approver");
        _;
    }

    function authorizeApprover(address _approver) public onlyOwner {
        approvers[_approver] = true;
    }

    function deauthorizeApprover(address _approver) public onlyOwner {
        approvers[_approver] = false;
    }

    function addStudent(uint _id, string memory _name, string memory _course, string memory _email) public {
        students[_id] = Student(_id, _name, _course, _email, false, false);
    }

    function requestRecommendation(uint _id) public {
        students[_id].recommendationRequested = true;
    }

    function approveRecommendation(uint _id) public onlyApprover {
        students[_id].recommendationApproved = true;
    }

    function getStudent(uint _id) public view returns (
        string memory,
        string memory,
        string memory,
        bool,
        bool
    ) {
        Student memory s = students[_id];
        return (
            s.name,
            s.course,
            s.email,
            s.recommendationRequested,
            s.recommendationApproved
        );
    }
}