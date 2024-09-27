// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract discord_Clone is ERC721 {
    address public owner;
    uint256 public totalChannels;
    uint256 public totalSupply;

    struct Channel {
        uint256 id;
        string name;
        uint256 cost;
    }

    mapping(uint256 => Channel) public channels;
    mapping(uint256 => mapping(address => bool)) public hasJoined;

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        owner = msg.sender;
    }

    function createChannel(
        string memory _name,
        uint256 _cost
    ) public onlyOwner {
        totalChannels++;
        channels[totalChannels] = Channel(totalChannels, _name, _cost);
    }

    function getChannel(uint256 _id) public view returns (Channel memory) {
        return channels[_id];
    }

    // mint function to create NFT and pass to the buyer
    function mint(uint256 _id) public payable {
        require(_id != 0, "Channel ID cannot be zero");
        require(_id <= totalChannels, "Invalid channel ID");
        require(hasJoined[_id][msg.sender] == false, "Already joined this channel");
        require(msg.value >= channels[_id].cost, "Insufficient funds");

        // Join channel
        hasJoined[_id][msg.sender] = true;

        // mint NFT
        totalSupply++;
        _safeMint(msg.sender, totalSupply);
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}
