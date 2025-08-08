// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MentorChatStorage {
    struct ChatRoom {
        uint256 bookingId;
        address user;
        uint256 mentorId;
        uint256 createdAt;
        bool active;
    }

    struct Message {
        uint256 chatRoomId;
        address sender;
        string content;
        uint256 timestamp;
        bool isFromMentor;
    }

    uint256 public chatRoomCount;
    uint256 public messageCount;
    
    mapping(uint256 => ChatRoom) public chatRooms;
    mapping(uint256 => Message) public messages;
    mapping(uint256 => uint256[]) public chatRoomMessages; // chatRoomId => messageIds
    mapping(address => uint256[]) public userChatRooms; // user => chatRoomIds
    mapping(uint256 => uint256) public bookingToChatRoom; // bookingId => chatRoomId
    mapping(uint256 => mapping(address => bool)) public authorizedSenders; // chatRoomId => user => authorized

    event ChatRoomCreated(uint256 indexed chatRoomId, uint256 indexed bookingId, address indexed user, uint256 mentorId);
    event MessageSent(uint256 indexed chatRoomId, uint256 indexed messageId, address indexed sender, bool isFromMentor);
    event SenderAuthorized(uint256 indexed chatRoomId, address indexed user);

    function createChatRoom(uint256 bookingId, address user, uint256 mentorId) external returns (uint256) {
        require(bookingToChatRoom[bookingId] == 0, "Chat room already exists for this booking");
        
        chatRoomCount++;
        chatRooms[chatRoomCount] = ChatRoom({
            bookingId: bookingId,
            user: user,
            mentorId: mentorId,
            createdAt: block.timestamp,
            active: true
        });
        
        userChatRooms[user].push(chatRoomCount);
        bookingToChatRoom[bookingId] = chatRoomCount;
        
        // Automatically authorize the user to send messages in this chatroom
        authorizedSenders[chatRoomCount][user] = true;
        
        emit ChatRoomCreated(chatRoomCount, bookingId, user, mentorId);
        emit SenderAuthorized(chatRoomCount, user);
        return chatRoomCount;
    }

    function sendMessage(uint256 chatRoomId, string memory content, bool isFromMentor) external {
        require(chatRooms[chatRoomId].active, "Chat room not active");
        require(bytes(content).length > 0, "Message cannot be empty");
        
        // Verify sender is authorized
        if (!isFromMentor) {
            require(authorizedSenders[chatRoomId][msg.sender], "Not authorized to send messages in this chatroom");
        }
        
        messageCount++;
        messages[messageCount] = Message({
            chatRoomId: chatRoomId,
            sender: msg.sender,
            content: content,
            timestamp: block.timestamp,
            isFromMentor: isFromMentor
        });
        
        chatRoomMessages[chatRoomId].push(messageCount);
        
        emit MessageSent(chatRoomId, messageCount, msg.sender, isFromMentor);
    }

    function getChatRoomsForUser(address user) external view returns (uint256[] memory) {
        return userChatRooms[user];
    }

    function getMessagesForChatRoom(uint256 chatRoomId) external view returns (uint256[] memory) {
        return chatRoomMessages[chatRoomId];
    }

    function getChatRoomByBooking(uint256 bookingId) external view returns (uint256) {
        return bookingToChatRoom[bookingId];
    }
    
    // Manual authorization function (if needed)
    function authorizeSender(uint256 chatRoomId, address user) external {
        require(chatRooms[chatRoomId].active, "Chat room not active");
        require(msg.sender == chatRooms[chatRoomId].user, "Only chatroom owner can authorize");
        
        authorizedSenders[chatRoomId][user] = true;
        emit SenderAuthorized(chatRoomId, user);
    }
    
    // Check if a user is authorized to send messages in a chatroom
    function isAuthorized(uint256 chatRoomId, address user) external view returns (bool) {
        return authorizedSenders[chatRoomId][user];
    }
}
