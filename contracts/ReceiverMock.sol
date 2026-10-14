// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library Client {
    struct EVMTokenAmount {
        address token;
        uint256 amount;
    }
    struct Any2EVMMessage {
        bytes32 messageId;
        uint64 sourceChainSelector;
        bytes sender;
        bytes data;
        EVMTokenAmount[] destTokenAmounts;
    }
}

interface IAny2EVMMessageReceiver {
    function ccipReceive(Client.Any2EVMMessage calldata message) external;
}

contract ReceiverMock is IAny2EVMMessageReceiver {
    address public immutable ccipRouter;

    event MessageReceived(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address sender,
        string text
    );

    constructor(address router) {
        ccipRouter = router;
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == type(IAny2EVMMessageReceiver).interfaceId || interfaceId == 0x01ffc9a7;
    }

    function ccipReceive(Client.Any2EVMMessage calldata any2EvmMessage) external override {
        require(msg.sender == ccipRouter, "Only CCIP router can call this");

        bytes32 messageId = any2EvmMessage.messageId;
        uint64 sourceChainSelector = any2EvmMessage.sourceChainSelector;

        address sender = abi.decode(any2EvmMessage.sender, (address));
        string memory text = abi.decode(any2EvmMessage.data, (string));

        emit MessageReceived(messageId, sourceChainSelector, sender, text);
    }
}