// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract DonationCampaign {
    address public owner;

    struct Donor {
        bool donated;
        uint256 amountDonated;
    }

    string public title;
    uint256 targetAmount;
    uint256 amountReceived;

    mapping(address => Donor) public donors;

    constructor(string memory _title, uint256 _targetAmount) {
        owner = msg.sender;
        title = _title;
        targetAmount = _targetAmount;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function donate() public payable {
        // make sure the amount is greater than 0
        require(msg.value > 0, "You must send some Ether");

        Donor storage spender = donors[msg.sender];

        spender.donated = true;
        spender.amountDonated += msg.value;
        amountReceived += msg.value;
    }

    function withdraw() public onlyOwner {
        address _owner = owner;

        // We need to check if the campaign contract balance is equal to or greater than the target
        // Then we perform the % deduction here

        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    function totalDonation() external view returns(uint256) {
        return amountReceived;
    }

    function donationTarget() external view returns(uint256) {
        return targetAmount;
    }

    function isTargetReached() public view returns (bool) {
        return amountReceived >= targetAmount;
    }

    // Functions below makes this contract payable
    receive() external payable {}

    fallback() external payable {}
}