// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

import {FtsoV2Interface} from "@flarenetwork/flare-periphery-contracts/coston2/FtsoV2Interface.sol";
import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";
import {IFtsoFeedIdConverter} from "@flarenetwork/flare-periphery-contracts/coston2/IFtsoFeedIdConverter.sol";
import {RandomNumberV2Interface} from "@flarenetwork/flare-periphery-contracts/coston2/RandomNumberV2Interface.sol";

contract BlockPass is ERC721URIStorage, Ownable {
    using Strings for uint256;

    struct TicketPassDetails {
        address organizer;
        string metadata;
        string category;
        address tokenAddress;
        int64 passesSold;
        int64 maxPasses;
        uint256 passPriceUSD;
        uint256 startTime;
        uint256 salesEndTime;
        bool bpEnded;
    }

    uint256 private nextTokenId = 1;

    uint256 public ticketPassCount;
    uint256 public volatilityThreshold = 10;
    TicketPassDetails[] public blockPassList;

    RandomNumberV2Interface private rnd;

    mapping(uint256 => TicketPassDetails) public ticketPasses;
    mapping(address => uint256[]) public passesPurchasedByUser;
    mapping(address => uint256[]) public tokenOfOwnerByIndex;

    mapping(string => uint256) public lastSavedPrice;
    mapping(string => uint256) public lastSavedTimestamp;

    event PassCreated(uint256 indexed ticketId, address indexed organizer);
    event PassPurchased(address indexed buyer, uint256 indexed ticketId, uint256 tokenId, uint256 pricePaid, bool bonus);
    event USDInWei(uint256 priceInWei);

    constructor() ERC721("BlockPass", "BPASS") Ownable(msg.sender) {
        rnd = ContractRegistry.getRandomNumberV2();
    }

    function createNewPass(
        int64 maxPasses,
        uint256 passPriceUSD,
        string memory metadata,
        string memory category,
        uint256 salesEndTime
    ) external {
        TicketPassDetails memory newPass = TicketPassDetails({
            organizer: msg.sender,
            metadata: metadata,
            category: category,
            tokenAddress: address(this),
            passesSold: 0,
            maxPasses: maxPasses,
            passPriceUSD: passPriceUSD,
            startTime: block.timestamp,
            salesEndTime: block.timestamp + salesEndTime,
            bpEnded: false
        });

        ticketPasses[ticketPassCount] = newPass;
        blockPassList.push(newPass);
        emit PassCreated(ticketPassCount, msg.sender);
        ticketPassCount++;
    }

    function purchasePass(uint256 _ticketId) external payable {
        TicketPassDetails storage pass = ticketPasses[_ticketId];

        require(block.timestamp >= pass.startTime && block.timestamp <= pass.salesEndTime, "Not in sale window");
        require(!pass.bpEnded, "Sales ended");
        require(pass.passesSold < pass.maxPasses, "Sold out");

        _ensureSavedPrice("FLR/USD");

        uint256 originalPriceInFLR = _convertUsdToFLRWei(pass.passPriceUSD);
        uint256 priceToPay = originalPriceInFLR;

        if (_isVolatilityHigh("FLR/USD")) {
            priceToPay = (originalPriceInFLR * 90) / 100; // Apply 10% discount
        }

        require(msg.value >= priceToPay, "Insufficient FLR sent");

        bool bonus = _isWinner();

        string memory tokenURI = _generateTokenURI(_ticketId, priceToPay, originalPriceInFLR, bonus);

        _safeMint(msg.sender, nextTokenId);
        _setTokenURI(nextTokenId, tokenURI);

        ticketPasses[_ticketId].passesSold++;
        passesPurchasedByUser[msg.sender].push(_ticketId);
        tokenOfOwnerByIndex[msg.sender].push(nextTokenId);

        emit PassPurchased(msg.sender, _ticketId,nextTokenId, priceToPay, bonus);

        uint256 organizerAmount = (priceToPay * 90) / 100;
        payable(pass.organizer).transfer(organizerAmount);

        if (msg.value > priceToPay) {
            payable(msg.sender).transfer(msg.value - priceToPay);
        }

       nextTokenId++;
    }

    function _convertUsdToFLRWei(uint256 usdAmount) public returns (uint256 flrPriceInWei) {
        FtsoV2Interface ftsoV2 = ContractRegistry.getFtsoV2();
        bytes21 usdFeedId = ContractRegistry.getFtsoFeedIdConverter().getFeedId(1, "FLR/USD");

        (flrPriceInWei, ) = ftsoV2.getFeedByIdInWei(usdFeedId);
        require(flrPriceInWei > 0, "Invalid FTSO price");

        flrPriceInWei = (usdAmount * 1e18) / flrPriceInWei;
        emit USDInWei(flrPriceInWei);
    }

    function _generateTokenURI(
        uint256 _ticketId,
        uint256 _pricePaid,
        uint256 _originalPrice,
        bool _bonus
    ) internal view returns (string memory) {
        TicketPassDetails storage pass = ticketPasses[_ticketId];

        string memory json = string(abi.encodePacked(
            '{"name":"BlockPass #', _ticketId.toString(),
            '", "description":"Exclusive access pass for ', pass.category,
            '", "pricePaid":"', _pricePaid.toString(),
            '", "originalPrice":"', _originalPrice.toString(),
            '", "bonus":"', _bonus ? "Winner Bonus" : "No Bonus",
            '", "metadata":"', pass.metadata,'"}'
        ));

        return string(abi.encodePacked(
            "data:application/json;base64,", Base64.encode(bytes(json))
        ));
    }

    function _isWinner() internal view returns (bool) {
        (uint256 rand,,) = rnd.getRandomNumber();
        return rand % 5 == 0;
    }

    function _isVolatilityHigh(string memory feedName) internal returns (bool) {
        uint256 currentPrice = _getCurrentPrice(feedName);
        uint256 oldPrice = lastSavedPrice[feedName];

        uint256 diff = currentPrice > oldPrice ? currentPrice - oldPrice : oldPrice - currentPrice;
        uint256 percentageChange = (diff * 100) / oldPrice;

        return percentageChange >= volatilityThreshold;
    }

    function _getCurrentPrice(string memory feedName) internal returns (uint256) {
        FtsoV2Interface ftsoV2 = ContractRegistry.getFtsoV2();
        bytes21 feedId = ContractRegistry.getFtsoFeedIdConverter().getFeedId(1, feedName);
        (uint256 price, ) = ftsoV2.getFeedByIdInWei(feedId);

        require(price > 0, "Invalid FTSO price");
        return price;
    }

    function _ensureSavedPrice(string memory feedName) internal {
        if (lastSavedPrice[feedName] == 0) {
            FtsoV2Interface ftsoV2 = ContractRegistry.getFtsoV2();
            bytes21 feedId = ContractRegistry.getFtsoFeedIdConverter().getFeedId(1, feedName);
            (uint256 price, ) = ftsoV2.getFeedByIdInWei(feedId);
            require(price > 0, "Invalid feed price");
            lastSavedPrice[feedName] = price;
            lastSavedTimestamp[feedName] = block.timestamp;
        }
    }

    function setVolatilityThreshold(uint256 _threshold) external onlyOwner {
        volatilityThreshold = _threshold;
    }

    function allBlockPassList() external view returns (TicketPassDetails[] memory) {
        return blockPassList;
    }

    function getUserTokens(address user) external view returns (uint256[] memory) {
       uint256 balance = balanceOf(user);
        uint256[] memory result = new uint256[](balance);
        for (uint256 i = 0; i < balance; i++) {
            result[i] = tokenOfOwnerByIndex[user][i];
        }
        return result;
    }

    function getByCategory(string memory category) external view returns (TicketPassDetails[] memory) {
       uint256 i = 0;
        uint256 arrayCount = 0;
        TicketPassDetails[] memory blockPassCategory = new TicketPassDetails[](
            blockPassList.length
        );

        for (; i < blockPassList.length; i++) {
            TicketPassDetails memory currentBPass = blockPassList[i];

            if (
                keccak256(abi.encodePacked(currentBPass.category)) ==
                keccak256(abi.encodePacked(category))
            ) {
                blockPassCategory[arrayCount] = currentBPass;
                arrayCount++;
            }
        }

        return blockPassCategory;
    }

    function getAllPasses() external view returns (TicketPassDetails[] memory) {
        TicketPassDetails[] memory result = new TicketPassDetails[](ticketPassCount);
        for (uint256 i = 0; i < ticketPassCount; i++) {
            result[i] = ticketPasses[i];
        }
        return result;
    }

    function getUserPurchases(address user) external view returns (uint256[] memory) {
        return passesPurchasedByUser[user];
    }

    receive() external payable {}
    fallback() external payable {}
}
