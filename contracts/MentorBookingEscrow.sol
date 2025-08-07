// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MentorBookingEscrow {
    address public owner;
    
    struct Booking {
        address user;
        uint256 mentorId;
        uint256 date;
        string timeSlot;
        uint256 amount;
        uint256 timestamp;
    }

    uint256 public bookingCount;
    mapping(uint256 => Booking) public bookings;
    mapping(address => uint256[]) public userBookings;

    event Booked(uint256 indexed bookingId, address indexed user, uint256 indexed mentorId, uint256 date, string timeSlot, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function bookSession(uint256 mentorId, uint256 date, string memory timeSlot) external payable returns (uint256) {
        require(msg.value > 0, "Payment required");
        require(mentorId > 0, "Invalid mentor ID");

        bookingCount++;
        bookings[bookingCount] = Booking({
            user: msg.sender,
            mentorId: mentorId,
            date: date,
            timeSlot: timeSlot,
            amount: msg.value,
            timestamp: block.timestamp
        });
        
        userBookings[msg.sender].push(bookingCount);

        emit Booked(bookingCount, msg.sender, mentorId, date, timeSlot, msg.value);
        return bookingCount;
    }

    function getBookingsForUser(address user) external view returns (uint256[] memory) {
        return userBookings[user];
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getBooking(uint256 bookingId) external view returns (Booking memory) {
        return bookings[bookingId];
    }

    // Owner can withdraw funds if needed
    function withdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner).transfer(balance);
    }
}