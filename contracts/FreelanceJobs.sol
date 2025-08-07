// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FreelanceJobs is Ownable, ReentrancyGuard {
    struct Job {
        uint256 jobId;
        address employer;
        string title;
        string description;
        string skills;
        uint256 budget; // Budget in wei
        uint256 durationInDays;
        uint256 stakeRequired; // Stake required from applicants in wei
        bool isPosted;
    }

    uint256 private nextJobId;
    mapping(uint256 => Job) public jobs;

    uint256 public constant POSTING_FEE = 5000000000000000; // 0.005 ETH in wei

    event JobPosted(
        uint256 indexed jobId,
        address indexed employer,
        string title,
        uint256 budget
    );

    constructor(address initialOwner) Ownable(initialOwner) {
        nextJobId = 1;
    }

    /**
     * @dev Posts a new job listing.
     * The employer must send the correct posting fee with the transaction.
     * @param _title The title of the job.
     * @param _description The description of the job.
     * @param _skills A JSON string of skills required for the job.
     * @param _budget The total budget for the job in wei.
     * @param _durationInDays The expected duration of the job in days.
     * @param _stakeRequired The stake amount required from applicants in wei.
     */
    function postJob(
        string memory _title,
        string memory _description,
        string memory _skills,
        uint256 _budget,
        uint256 _durationInDays,
        uint256 _stakeRequired
    ) external payable nonReentrant {
        require(msg.value == POSTING_FEE, "Incorrect posting fee provided.");
        require(bytes(_title).length > 0, "Title cannot be empty.");
        require(bytes(_description).length > 0, "Description cannot be empty.");
        require(_budget > 0, "Budget must be greater than zero.");
        require(_durationInDays > 0, "Duration must be greater than zero.");

        uint256 jobId = nextJobId;
        jobs[jobId] = Job({
            jobId: jobId,
            employer: msg.sender,
            title: _title,
            description: _description,
            skills: _skills,
            budget: _budget,
            durationInDays: _durationInDays,
            stakeRequired: _stakeRequired,
            isPosted: true
        });

        nextJobId++;

        emit JobPosted(jobId, msg.sender, _title, _budget);
    }

    /**
     * @dev Withdraws the posting fees. Only the contract owner can call this.
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw.");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Failed to withdraw fees.");
    }
}