// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ChatStorage {
    string[] public messages;

    event MessageStored(address indexed user, string message);

    function storeMessage(string calldata message) public {
        messages.push(message);
        emit MessageStored(msg.sender, message);
    }

    function getMessages() public view returns (string[] memory) {
        return messages;
    }
}
