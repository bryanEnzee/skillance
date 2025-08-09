// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MentorRegistry {
    struct Mentor {
        uint256 id;
        address mentorAddress;
        string name;
        string expertiseArea;
        string bio;
        uint256 hourlyRate; // in wei
        string portfolioUrl;
        uint256 yearsExperience;
        string[] skills;
        string[] languages;
        string profileImageHash; // IPFS hash
        bool isVerified;
        bool isActive;
        uint256 registrationDate;
        uint256 totalSessions;
        uint256 totalRating; // Sum of all ratings
        uint256 ratingCount; // Number of ratings
    }

    struct Review {
        uint256 mentorId;
        address reviewer;
        uint256 rating; // 1-5 stars
        string comment;
        uint256 timestamp;
        uint256 sessionId;
    }

    uint256 public mentorCount;
    uint256 public reviewCount;
    
    mapping(uint256 => Mentor) public mentors;
    mapping(address => uint256) public mentorAddressToId;
    mapping(uint256 => Review[]) public mentorReviews;
    mapping(uint256 => Review) public reviews;
    mapping(address => bool) public admins;
    
    // Search and filter mappings
    mapping(string => uint256[]) public mentorsByExpertise;
    mapping(uint256 => uint256[]) public mentorsByRating; // rating (1-5) => mentor IDs
    mapping(uint256 => uint256[]) public mentorsByPriceRange; // price range index => mentor IDs
    
    event MentorRegistered(uint256 indexed mentorId, address indexed mentorAddress, string name);
    event MentorVerified(uint256 indexed mentorId, bool verified);
    event ReviewSubmitted(uint256 indexed mentorId, uint256 indexed reviewId, address indexed reviewer, uint256 rating);
    event MentorUpdated(uint256 indexed mentorId);

    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admin can perform this action");
        _;
    }

    modifier onlyMentor(uint256 mentorId) {
        require(mentors[mentorId].mentorAddress == msg.sender, "Only mentor can update their profile");
        require(mentors[mentorId].isActive, "Mentor is not active");
        _;
    }

    constructor() {
        admins[msg.sender] = true; // Contract deployer is first admin
    }

    function addAdmin(address admin) external onlyAdmin {
        admins[admin] = true;
    }

    function removeAdmin(address admin) external onlyAdmin {
        admins[admin] = false;
    }

    function selfRegister(
        string memory _name,
        string memory _expertiseArea,
        string memory _bio,
        uint256 _hourlyRate,
        string memory _portfolioUrl,
        uint256 _yearsExperience,
        string[] memory _skills,
        string[] memory _languages
    ) external returns (uint256) {
        // Commented out for debugging - allow multiple registrations
        // require(mentorAddressToId[msg.sender] == 0, "Mentor already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_hourlyRate > 0, "Hourly rate must be greater than 0");

        mentorCount++;
        uint256 newMentorId = mentorCount;
        
        // Initialize mentor with basic info
        mentors[newMentorId].id = newMentorId;
        mentors[newMentorId].mentorAddress = msg.sender;
        mentors[newMentorId].name = _name;
        mentors[newMentorId].expertiseArea = _expertiseArea;
        mentors[newMentorId].bio = _bio;
        mentors[newMentorId].hourlyRate = _hourlyRate;
        mentors[newMentorId].portfolioUrl = _portfolioUrl;
        mentors[newMentorId].yearsExperience = _yearsExperience;
        mentors[newMentorId].skills = _skills;
        mentors[newMentorId].languages = _languages;
        
        // Set default values
        mentors[newMentorId].isVerified = false;
        mentors[newMentorId].isActive = true;
        mentors[newMentorId].registrationDate = block.timestamp;
        mentors[newMentorId].totalSessions = 0;
        mentors[newMentorId].totalRating = 0;
        mentors[newMentorId].ratingCount = 0;

        // For debugging: Update mapping to latest registration
        // Note: This will overwrite previous mentor ID for same address
        mentorAddressToId[msg.sender] = newMentorId;
        mentorsByExpertise[_expertiseArea].push(newMentorId);

        emit MentorRegistered(newMentorId, msg.sender, _name);
        return newMentorId;
    }

    function updateProfile(
        uint256 mentorId,
        string memory _bio,
        uint256 _hourlyRate,
        string memory _portfolioUrl,
        string[] memory _skills,
        string[] memory _languages,
        string memory _profileImageHash
    ) external onlyMentor(mentorId) {
        Mentor storage mentor = mentors[mentorId];
        mentor.bio = _bio;
        mentor.hourlyRate = _hourlyRate;
        mentor.portfolioUrl = _portfolioUrl;
        mentor.skills = _skills;
        mentor.languages = _languages;
        mentor.profileImageHash = _profileImageHash;

        emit MentorUpdated(mentorId);
    }

    function verifyMentor(uint256 mentorId, bool verified) external onlyAdmin {
        require(mentors[mentorId].id != 0, "Mentor does not exist");
        mentors[mentorId].isVerified = verified;
        emit MentorVerified(mentorId, verified);
    }

    function submitReview(
        uint256 mentorId,
        uint256 rating,
        string memory comment,
        uint256 sessionId
    ) external returns (uint256) {
        require(mentors[mentorId].id != 0, "Mentor does not exist");
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        require(bytes(comment).length > 0, "Comment cannot be empty");

        reviewCount++;
        
        Review memory newReview = Review({
            mentorId: mentorId,
            reviewer: msg.sender,
            rating: rating,
            comment: comment,
            timestamp: block.timestamp,
            sessionId: sessionId
        });

        reviews[reviewCount] = newReview;
        mentorReviews[mentorId].push(newReview);

        // Update mentor rating
        Mentor storage mentor = mentors[mentorId];
        mentor.totalRating += rating;
        mentor.ratingCount++;

        emit ReviewSubmitted(mentorId, reviewCount, msg.sender, rating);
        return reviewCount;
    }

    function getMentor(uint256 mentorId) external view returns (
        uint256 id,
        address mentorAddress,
        string memory name,
        string memory expertiseArea,
        string memory bio,
        uint256 hourlyRate,
        string memory portfolioUrl,
        uint256 yearsExperience,
        string[] memory skills,
        string[] memory languages,
        string memory profileImageHash,
        bool isVerified,
        bool isActive,
        uint256 registrationDate,
        uint256 totalSessions,
        uint256 averageRating // calculated as totalRating / ratingCount * 100 (to avoid decimals)
    ) {
        Mentor storage mentor = mentors[mentorId];
        require(mentor.id != 0, "Mentor does not exist");
        
        uint256 avgRating = mentor.ratingCount > 0 ? (mentor.totalRating * 100) / mentor.ratingCount : 0;
        
        return (
            mentor.id,
            mentor.mentorAddress,
            mentor.name,
            mentor.expertiseArea,
            mentor.bio,
            mentor.hourlyRate,
            mentor.portfolioUrl,
            mentor.yearsExperience,
            mentor.skills,
            mentor.languages,
            mentor.profileImageHash,
            mentor.isVerified,
            mentor.isActive,
            mentor.registrationDate,
            mentor.totalSessions,
            avgRating
        );
    }

    function getMentorsByExpertise(string memory expertise) external view returns (uint256[] memory) {
        return mentorsByExpertise[expertise];
    }

    function getMentorReviews(uint256 mentorId) external view returns (Review[] memory) {
        return mentorReviews[mentorId];
    }

    function getAllMentors() external view returns (uint256[] memory) {
        uint256[] memory allMentors = new uint256[](mentorCount);
        for (uint256 i = 1; i <= mentorCount; i++) {
            if (mentors[i].isActive) {
                allMentors[i-1] = i;
            }
        }
        return allMentors;
    }

    function getVerifiedMentors() external view returns (uint256[] memory) {
        uint256 verifiedCount = 0;
        
        // First pass: count verified mentors
        for (uint256 i = 1; i <= mentorCount; i++) {
            if (mentors[i].isActive && mentors[i].isVerified) {
                verifiedCount++;
            }
        }
        
        // Second pass: populate array
        uint256[] memory verifiedMentors = new uint256[](verifiedCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= mentorCount; i++) {
            if (mentors[i].isActive && mentors[i].isVerified) {
                verifiedMentors[index] = i;
                index++;
            }
        }
        
        return verifiedMentors;
    }

    function incrementSessionCount(uint256 mentorId) external {
        // This should be called by the booking contract
        require(mentors[mentorId].id != 0, "Mentor does not exist");
        mentors[mentorId].totalSessions++;
    }
}
