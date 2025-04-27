// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

import {FtsoV2Interface} from "@flarenetwork/flare-periphery-contracts/coston2/FtsoV2Interface.sol";
import {TestFtsoV2Interface} from "@flarenetwork/flare-periphery-contracts/coston2/TestFtsoV2Interface.sol";
import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";
import {IFtsoFeedIdConverter} from "@flarenetwork/flare-periphery-contracts/coston2/IFtsoFeedIdConverter.sol";


contract BlockPass is ERC721URIStorage, Ownable {
    struct PassDetails {
        uint256 blockPassId;
        uint256 passPriceUSD;
        uint256 start_time;
        uint256 end_time;
        string category;
        address organizer;
        uint256 max_passes;
        uint256 passesSold;
    }

    uint256 public totalPasses;
    uint256 public nextTokenId;
    uint256 public volatilityThreshold = 10;

    mapping(uint256 => PassDetails) public getPassById;
    PassDetails[] public blockPassList;

    mapping(address => PassDetails[]) public blockPassesBookedByUser;
    mapping(uint256 => address) public tokenIdToOwner;
    mapping(string => uint256) public lastSavedPrice;
    mapping(string => uint256) public lastSavedTimestamp;

    event PassBooked(address indexed buyer, uint256 tokenId, uint256 blockPassId, uint256 pricePaid, bool bonus);
    event USDInWei(uint256 priceInWei);

    constructor() ERC721("BlockPass", "BPASS") Ownable(msg.sender) {
    }

    function createNewPass(
        uint256 passPriceUSD,
        uint256 start_time,
        uint256 end_time,
        string memory category,
        uint256 max_passes
    ) external {
        require(start_time < end_time, "Invalid time window");

        PassDetails memory pass = PassDetails({
            blockPassId: totalPasses,
            passPriceUSD: passPriceUSD,
            start_time: start_time,
            end_time: end_time,
            category: category,
            organizer: msg.sender,
            max_passes: max_passes,
            passesSold: 0
        });

        getPassById[totalPasses] = pass;
        blockPassList.push(pass);
        totalPasses++;
    }


    function purchasePass(uint256 _blockPassId) public payable {
        PassDetails storage _pass = getPassById[_blockPassId];

        require(block.timestamp >= _pass.start_time && block.timestamp <= _pass.end_time, "Not within sale window");
        require(_pass.passesSold < _pass.max_passes, "Sold out");

        _ensureSavedPrice("FLR/USD");

        uint256 originalPriceInFLR = convertUsdToFLRWei(_pass.passPriceUSD);
        uint256 passPrice = originalPriceInFLR;

        // Apply 10% discount during high volatility
        if (_isVolatilityHigh("FLR/USD")) {
            passPrice = (originalPriceInFLR * 90) / 100;
        }


        require(msg.value >= passPrice, "Insufficient FLR payment");

        bool bonus = _isWinner();
        string memory tokenURI = _generateTokenURI(_pass, passPrice, originalPriceInFLR, bonus);

        _safeMint(msg.sender, nextTokenId);
        _setTokenURI(nextTokenId, tokenURI);

        tokenIdToOwner[nextTokenId] = msg.sender;
        blockPassesBookedByUser[msg.sender].push(_pass);
        _pass.passesSold++;

        emit PassBooked(msg.sender, nextTokenId, _blockPassId, passPrice, bonus);

        uint256 organizerAmount = (passPrice * 90) / 100;
        payable(_pass.organizer).transfer(organizerAmount);

        if (msg.value > passPrice) {
            payable(msg.sender).transfer(msg.value - passPrice);
        }

        nextTokenId++;
    }


    function convertUsdToFLRWei(uint256 usdAmount) public returns (uint256 flrPriceInWei) {
        FtsoV2Interface ftsoV2 = ContractRegistry.getFtsoV2();
        //TestFtsoV2Interface ftsoV2 = ContractRegistry.getTestFtsoV2();
        bytes21 usdFeedId = ContractRegistry
            .getFtsoFeedIdConverter()
            .getFeedId(1, "FLR/USD");

        (flrPriceInWei, ) = ftsoV2.getFeedByIdInWei(usdFeedId);

        require(flrPriceInWei > 0, "Invalid FTSO price");

        // Convert USD amount to FLR in Wei
        flrPriceInWei = (usdAmount * 1e18) / flrPriceInWei;
        emit USDInWei(flrPriceInWei);
    }

    // Debugging event
    event DebugLog(string message, bytes data);

    //check if it returns a valid feedId
    //try it with test interface

    function _generateTokenURI(PassDetails memory _pass, uint256 passPrice, uint256 originalPrice, bool bonus) internal pure returns (string memory) {
        string memory json = string(abi.encodePacked(
            '{"name": "BlockPass #', Strings.toString(_pass.blockPassId),
            '", "description": "Exclusive access pass", "category": "', _pass.category,
            '", "price": "', Strings.toString(passPrice),
            '", "originalPrice": "', Strings.toString(originalPrice),
            '", "bonus": "', bonus ? "Bonus Perk: WINNER" : "No Bonus Perk",
            '", "discountMessage": "', passPrice < originalPrice ? "Discount applied!" : "No discount",
            '"}'
        ));

        return string(abi.encodePacked(
            "data:application/json;base64,", Base64.encode(bytes(json))
        ));
    }

    function _isWinner() internal view returns (bool) {
        // (uint256 rand,,) = rng.getRandomNumber();
        // return rand % 5 == 0; // 20% chance to win perk;
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

    function allBlockPassList() external view returns (PassDetails[] memory) {
        return blockPassList;
    }

    function getUserTokens(address user) external view returns (uint256[] memory) {
        uint256 count;
        for (uint256 i = 0; i < nextTokenId; i++) {
            if (tokenIdToOwner[i] == user) {
                count++;
            }
        }

        uint256[] memory tokens = new uint256[](count);
        uint256 index;
        for (uint256 i = 0; i < nextTokenId; i++) {
            if (tokenIdToOwner[i] == user) {
                tokens[index++] = i;
            }
        }
        return tokens;
    }

    function getByCategory(string memory category) external view returns (PassDetails[] memory) {
        uint256 count;
        for (uint256 i = 0; i < blockPassList.length; i++) {
            if (keccak256(bytes(blockPassList[i].category)) == keccak256(bytes(category))) {
                count++;
            }
        }

        PassDetails[] memory filtered = new PassDetails[](count);
        uint256 index;
        for (uint256 i = 0; i < blockPassList.length; i++) {
            if (keccak256(bytes(blockPassList[i].category)) == keccak256(bytes(category))) {
                filtered[index++] = blockPassList[i];
            }
        }

        return filtered;
    }

     function getTokenPriceInUSDWei(
        string memory feedName
    ) public returns (uint256 _priceInWei, uint256 _finalizedTimestamp) {
        FtsoV2Interface ftsoV2 = ContractRegistry.getFtsoV2();
        (_priceInWei, _finalizedTimestamp) = ftsoV2.getFeedByIdInWei(
            ContractRegistry.getFtsoFeedIdConverter().getFeedId(1, feedName)
        );
    }

    function flrUsdConversion() external view returns (bytes21) {
        IFtsoFeedIdConverter feedIdConverter = ContractRegistry.getFtsoFeedIdConverter();
        return feedIdConverter.getFeedId(1, "FLR/USD");
    }

    function testFeedIdAndPrice(string memory feedName) public view returns (uint256 priceInWei, uint256 finalizedTimestamp) {
        // Use the TestFtsoV2Interface to fetch the price for testing purposes
        TestFtsoV2Interface ftsoV2 = ContractRegistry.getTestFtsoV2();
        bytes21 feedId = ContractRegistry.getFtsoFeedIdConverter().getFeedId(1, feedName);

        // Fetch the price and timestamp using the test interface
        (priceInWei, finalizedTimestamp) = ftsoV2.getFeedByIdInWei(feedId);

        // Ensure the price is valid
        require(priceInWei > 0, "Invalid test FTSO price");
    }

    receive() external payable {}

    fallback() external payable {}
}
