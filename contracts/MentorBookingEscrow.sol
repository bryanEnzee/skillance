// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MentorBookingEscrow {
    address public owner;
    uint256 public platformFeePercentage = 250; // 2.5% platform fee (250 basis points)
    uint256 public constant BASIS_POINTS = 10000;

    struct Booking {
        address user;
        address mentor;
        uint256 date;
        string timeSlot;
        uint256 amount;
        bool completed;
        bool refunded;
        uint256 timestamp;
    }

    uint256 public bookingCount;
    mapping(uint256 => Booking) public bookings;
    mapping(address => uint256[]) public mentorBookings;
    mapping(address => uint256[]) public userBookings;
    mapping(address => uint256) public mentorRates; // ETH per hour for each mentor
    mapping(address => bool) public registeredMentors;

    event Booked(uint256 indexed bookingId, address indexed user, address indexed mentor, uint256 date, string timeSlot, uint256 amount);
    event Completed(uint256 indexed bookingId, address indexed mentor);
    event Refunded(uint256 indexed bookingId, address indexed user);
    event MentorRegistered(address indexed mentor, uint256 rate);
    event RateUpdated(address indexed mentor, uint256 newRate);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    modifier onlyRegisteredMentor() {
        require(registeredMentors[msg.sender], "Not a registered mentor");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerMentor(address mentor, uint256 rateInWei) external onlyOwner {
        require(mentor != address(0), "Invalid mentor address");
        require(rateInWei > 0, "Rate must be greater than 0");
        
        registeredMentors[mentor] = true;
        mentorRates[mentor] = rateInWei;
        
        emit MentorRegistered(mentor, rateInWei);
    }

    function updateMentorRate(uint256 newRateInWei) external onlyRegisteredMentor {
        require(newRateInWei > 0, "Rate must be greater than 0");
        mentorRates[msg.sender] = newRateInWei;
        emit RateUpdated(msg.sender, newRateInWei);
    }

    function bookSession(address mentor, uint256 date, string memory timeSlot) external payable returns (uint256) {
        require(registeredMentors[mentor], "Mentor not registered");
        require(msg.value == mentorRates[mentor], "Incorrect ETH amount for this mentor");
        require(mentor != address(0), "Invalid mentor address");
        require(msg.sender != mentor, "Cannot book yourself");

        bookingCount++;
        bookings[bookingCount] = Booking({
            user: msg.sender,
            mentor: mentor,
            date: date,
            timeSlot: timeSlot,
            amount: msg.value,
            completed: false,
            refunded: false,
            timestamp: block.timestamp
        });
        mentorBookings[mentor].push(bookingCount);
        userBookings[msg.sender].push(bookingCount);

        emit Booked(bookingCount, msg.sender, mentor, date, timeSlot, msg.value);
        return bookingCount;
    }

    function completeSession(uint256 bookingId) external {
        Booking storage booking = bookings[bookingId];
        require(msg.sender == booking.mentor, "Only mentor can complete");
        require(!booking.completed, "Already completed");
        require(!booking.refunded, "Already refunded");

        booking.completed = true;
        payable(booking.mentor).transfer(booking.amount);
        emit Completed(bookingId, booking.mentor);
    }

    function refundSession(uint256 bookingId) external {
        Booking storage booking = bookings[bookingId];
        require(msg.sender == booking.user, "Only user can refund");
        require(!booking.completed, "Already completed");
        require(!booking.refunded, "Already refunded");

        booking.refunded = true;
        payable(booking.user).transfer(booking.amount);
        emit Refunded(bookingId, booking.user);
    }

    function getBookingsForMentor(address mentor) external view returns (uint256[] memory) {
        return mentorBookings[mentor];
    }

    function getBookingsForUser(address user) external view returns (uint256[] memory) {
        return userBookings[user];
    }
}