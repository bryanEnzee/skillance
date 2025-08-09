// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FreelanceJobs is Ownable, ReentrancyGuard {
    enum ApplicationStatus { Pending, Accepted, Rejected }

    struct Job {
        uint256 jobId;
        address employer;
        string title;
        string description;
        string skills;
        uint256 budget; // Budget in wei
        uint256 durationInDays;
        uint256 stakeRequired; 
        bool isPosted;
        bool hasFreelancer;
        address acceptedApplicant;
        string submittedWorkUrl;
        bool workSubmitted;
        bool paid;
    }

    struct Application {
        address applicant;
        string proposal;
        uint256 stakedAmount;
        ApplicationStatus status;
    }

    uint256 private nextJobId;
    mapping(uint256 => Job) public jobs;
    mapping(uint256 => Application[]) public applications;
    mapping(address => mapping(uint256 => bool)) private hasApplied;

    uint256 public constant POSTING_FEE = 5000000000000000; 
    uint256 public totalPostingFees;

    event JobPosted(
        uint256 indexed jobId,
        address indexed employer,
        string title,
        string description,
        string skills,
        uint256 budget,
        uint256 durationInDays,
        uint256 stakeRequired
    );

    event JobApplied(
        uint256 indexed jobId,
        address indexed applicant,
        string proposal,
        uint256 stakedAmount
    );

    event ApplicationStatusUpdated(
        uint256 indexed jobId,
        address indexed applicant,
        ApplicationStatus status
    );

    event WorkSubmitted(
        uint256 indexed jobId,
        address indexed freelancer,
        string submittedWorkUrl
    );

    event PaymentApproved(
        uint256 indexed jobId,
        address indexed freelancer,
        uint256 totalAmount
    );

    event StakeReturned(
        uint256 indexed jobId,
        address indexed applicant,
        uint256 stakeAmount
    );

    constructor(address initialOwner) Ownable(initialOwner) {
        nextJobId = 1;
    }

    /**
     * @dev Posts a new job listing.
     * The employer must send the correct posting fee and job budget with the transaction.
     */
    function postJob(
        string memory _title,
        string memory _description,
        string memory _skills,
        uint256 _budget,
        uint256 _durationInDays,
        uint256 _stakeRequired
    ) external payable nonReentrant {
        require(msg.value == POSTING_FEE + _budget, "Incorrect amount provided (needs posting fee + budget).");
        require(bytes(_title).length > 0, "Title cannot be empty.");
        require(bytes(_description).length > 0, "Description cannot be empty.");
        require(_budget > 0, "Budget must be greater than zero.");
        require(_durationInDays > 0, "Duration must be greater than zero.");
        require(_stakeRequired > 0, "Stake must be greater than zero.");

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
            isPosted: true,
            hasFreelancer: false,
            acceptedApplicant: address(0),
            submittedWorkUrl: "",
            workSubmitted: false,
            paid: false
        });
        nextJobId++;
        
        totalPostingFees += POSTING_FEE;

        emit JobPosted(
            jobId,
            msg.sender,
            _title,
            _description,
            _skills,
            _budget,
            _durationInDays,
            _stakeRequired
        );
    }

    /**
     * @dev Allows a freelancer to apply for a job.
     * The freelancer must send the required stake with the transaction.
     * @param _jobId The ID of the job to apply for.
     * @param _proposal The proposal message from the freelancer.
     */
    function applyForJob(uint256 _jobId, string memory _proposal) external payable nonReentrant {
        Job storage job = jobs[_jobId];
        require(job.isPosted, "Job does not exist.");
        require(msg.sender != job.employer, "Employer cannot apply for their own job.");
        require(msg.value == job.stakeRequired, "Incorrect stake amount provided.");
        require(!job.hasFreelancer, "Freelancer for this job has already been selected.");
        require(!hasApplied[msg.sender][_jobId], "You have already applied for this job.");

        applications[_jobId].push(Application({
            applicant: msg.sender,
            proposal: _proposal,
            stakedAmount: msg.value,
            status: ApplicationStatus.Pending
        }));
        
        hasApplied[msg.sender][_jobId] = true;

        emit JobApplied(_jobId, msg.sender, _proposal, msg.value);
    }

    /**
     * @dev Allows the employer to accept an applicant.
     * @param _jobId The ID of the job.
     * @param _applicantAddress The address of the applicant to accept.
     */
    function acceptApplication(uint256 _jobId, address _applicantAddress) external nonReentrant {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.employer, "Only the employer can accept an application.");
        require(!job.hasFreelancer, "A freelancer has already been accepted.");

        bool applicantFound = false;
        uint256 appCount = applications[_jobId].length;
        for (uint i = 0; i < appCount; i++) {
            Application storage app = applications[_jobId][i];
            if (app.applicant == _applicantAddress) {
                app.status = ApplicationStatus.Accepted;
                job.acceptedApplicant = _applicantAddress;
                job.hasFreelancer = true;
                applicantFound = true;
                emit ApplicationStatusUpdated(_jobId, _applicantAddress, ApplicationStatus.Accepted);
            } else if (app.status == ApplicationStatus.Pending) {
                // Reject other pending applicants and return their stake
                app.status = ApplicationStatus.Rejected;
                (bool success, ) = payable(app.applicant).call{value: app.stakedAmount}("");
                require(success, "Failed to return stake.");
                emit ApplicationStatusUpdated(_jobId, app.applicant, ApplicationStatus.Rejected);
                emit StakeReturned(_jobId, app.applicant, app.stakedAmount);
            }
        }
        require(applicantFound, "Applicant not found or already processed.");
    }
    
    /**
     * @dev Allows the employer to reject an applicant.
     * @param _jobId The ID of the job.
     * @param _applicantAddress The address of the applicant to reject.
     */
    function rejectApplication(uint256 _jobId, address _applicantAddress) external nonReentrant {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.employer, "Only the employer can reject an application.");
        require(!job.hasFreelancer, "A freelancer has already been accepted.");

        bool applicantFound = false;
        uint256 appCount = applications[_jobId].length;
        for (uint i = 0; i < appCount; i++) {
            Application storage app = applications[_jobId][i];
            if (app.applicant == _applicantAddress) {
                require(app.status == ApplicationStatus.Pending, "Application is not in Pending state.");
                app.status = ApplicationStatus.Rejected;
                (bool success, ) = payable(_applicantAddress).call{value: app.stakedAmount}("");
                require(success, "Failed to return stake.");
                applicantFound = true;
                emit ApplicationStatusUpdated(_jobId, _applicantAddress, ApplicationStatus.Rejected);
                emit StakeReturned(_jobId, _applicantAddress, app.stakedAmount);
                break;
            }
        }
        require(applicantFound, "Applicant not found.");
    }

    /**
     * @dev Allows the accepted freelancer to submit the work.
     * @param _jobId The ID of the job.
     * @param _submittedWorkUrl The URL of the submitted work.
     */
    function submitWork(uint256 _jobId, string memory _submittedWorkUrl) external nonReentrant {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.acceptedApplicant, "Only the accepted freelancer can submit work.");
        require(!job.workSubmitted, "Work has already been submitted.");
        require(bytes(_submittedWorkUrl).length > 0, "Work URL cannot be empty.");
        
        job.submittedWorkUrl = _submittedWorkUrl;
        job.workSubmitted = true;
        emit WorkSubmitted(_jobId, msg.sender, _submittedWorkUrl);
    }

    /**
     * @dev Allows the employer to approve the submitted work and release the payment.
     * @param _jobId The ID of the job.
     */
    function approveWork(uint256 _jobId) external nonReentrant {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.employer, "Only the employer can approve the work.");
        require(job.acceptedApplicant != address(0), "No freelancer has been accepted yet.");
        require(job.workSubmitted, "Work has not been submitted yet.");
        require(!job.paid, "Payment has already been made for this job.");

        uint256 totalPayment = job.budget + job.stakeRequired;
        (bool success, ) = payable(job.acceptedApplicant).call{value: totalPayment}("");
        require(success, "Failed to transfer payment to freelancer.");
        
        job.paid = true;

        emit PaymentApproved(_jobId, job.acceptedApplicant, totalPayment);
    }

    /**
     * @dev Withdraws the posting fees. Only the contract owner can call this.
     */
    function withdrawFees() external onlyOwner {
        uint256 feesToWithdraw = totalPostingFees;
        require(feesToWithdraw > 0, "No fees to withdraw.");
        totalPostingFees = 0;
        (bool success, ) = payable(owner()).call{value: feesToWithdraw}("");
        require(success, "Failed to withdraw fees.");
    }

    function getTotalJobs() external view returns (uint256) {
        return nextJobId - 1;
    }

    function getJob(uint256 _jobId) external view returns (
        uint256 jobId,
        address employer,
        string memory title,
        string memory description,
        string memory skills,
        uint256 budget,
        uint256 durationInDays,
        uint256 stakeRequired,
        bool isPosted
        ) {
            Job memory job = jobs[_jobId];
            require(job.isPosted, "Job does not exist.");
                return (
                    job.jobId,
                    job.employer,
                    job.title,
                    job.description,
                    job.skills,
                    job.budget,
                    job.durationInDays,
                    job.stakeRequired,
                    job.isPosted
                );
        }

    function getApplicationsCount(uint256 _jobId) external view returns (uint256) {
        return applications[_jobId].length;
    }

    function getApplication(uint256 _jobId, uint256 _index) external view returns (
        address applicant,
        string memory proposal,
        ApplicationStatus status
    ) {
        Application memory app = applications[_jobId][_index];
        return (app.applicant, app.proposal, app.status);
    }
}