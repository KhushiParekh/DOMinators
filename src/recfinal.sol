// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RECDominator is ERC20, Ownable {
    struct Listing {
        uint256 id;
        address seller;
        uint256 amount;
        uint256 price;
        string energyType;
        bool active;
    }

    struct ProducerInfo {
        string gst;
        string location;
        bool verified;
    }

    struct BuyerInfo {
        bool registered;
        bool approved;
    }

    struct TransactionHistory {
        address counterparty;
        uint256 amount;
        uint256 price;
        string energyType;
        uint256 timestamp;
    }

    uint256 private nextListingId;
    uint256 private minTradeAmount;
    mapping(address => ProducerInfo) private producers;
    mapping(address => BuyerInfo) private buyers;
    mapping(uint256 => Listing) private listings;
    mapping(address => mapping(string => uint256)) private balancesByEnergyType;
    mapping(address => TransactionHistory[]) private buyingHistory;
    mapping(address => TransactionHistory[]) private sellingHistory;

    event ProducerRegistered(address indexed producer, string gst, string location);
    event ProducerVerified(address indexed producer);
    event BuyerRegistered(address indexed buyer);
    event BuyerApproved(address indexed buyer);
    event Mint(address indexed producer, uint256 amount, string energyType);
    event Burn(address indexed producer, uint256 amount, string energyType);
    event TransferREC(address indexed from, address indexed to, uint256 amount, string energyType);
    event ListingCreated(uint256 indexed listingId, address indexed seller, uint256 amount, string energyType);
    event ListingCancelled(uint256 indexed listingId);
    event RECBought(address indexed buyer, uint256 indexed listingId, uint256 amount);

    constructor(address initialOwner) ERC20("RECDominator", "REC") Ownable(initialOwner) {
        nextListingId = 1;
        minTradeAmount = 1;
    }

    // Producer Management
    function registerAndVerifyProducer(string memory gst, string memory location) external {
        require(bytes(producers[msg.sender].gst).length == 0, "Already registered");
        producers[msg.sender] = ProducerInfo({ gst: gst, location: location, verified: true });
        emit ProducerRegistered(msg.sender, gst, location);
        emit ProducerVerified(msg.sender);
    }

    function getProducerInfo(address producer) external view returns (ProducerInfo memory) {
        return producers[producer];
    }

    // Buyer Management
    function registerBuyer() external {
        require(!buyers[msg.sender].registered, "Already registered");
        buyers[msg.sender] = BuyerInfo({ registered: true, approved: false });
        emit BuyerRegistered(msg.sender);
    }

    function approveBuyer(address buyer) external onlyOwner {
        require(buyers[buyer].registered, "Buyer not registered");
        buyers[buyer].approved = true;
        emit BuyerApproved(buyer);
    }

    function getBuyerInfo(address buyer) external view returns (BuyerInfo memory) {
        return buyers[buyer];
    }

    // Token Management
    function mintTokens(uint256 amount, string memory energyType) external {
        require(producers[msg.sender].verified, "Not a verified producer");
        _mint(msg.sender, amount);
        balancesByEnergyType[msg.sender][energyType] += amount;
        emit Mint(msg.sender, amount, energyType);
    }

    function burnTokens(uint256 amount, string memory energyType) external {
        require(balancesByEnergyType[msg.sender][energyType] >= amount, "Insufficient balance");
        balancesByEnergyType[msg.sender][energyType] -= amount;
        _burn(msg.sender, amount);
        emit Burn(msg.sender, amount, energyType);
    }

    function transferTokens(address to, uint256 amount, string memory energyType) external {
        require(balancesByEnergyType[msg.sender][energyType] >= amount, "Insufficient balance");
        require(buyers[to].approved, "Recipient is not an approved buyer");

        balancesByEnergyType[msg.sender][energyType] -= amount;
        balancesByEnergyType[to][energyType] += amount;
        emit TransferREC(msg.sender, to, amount, energyType);
    }

    function getBalanceByEnergyType(address account, string memory energyType) external view returns (uint256) {
        return balancesByEnergyType[account][energyType];
    }

    // Marketplace Functions
    function listTokens(uint256 amount, uint256 price, string memory energyType) external {
        require(balancesByEnergyType[msg.sender][energyType] >= amount, "Insufficient balance");
        require(amount >= minTradeAmount, "Amount below minimum trade");

        listings[nextListingId] = Listing({
            id: nextListingId,
            seller: msg.sender,
            amount: amount,
            price: price,
            energyType: energyType,
            active: true
        });

        balancesByEnergyType[msg.sender][energyType] -= amount;
        emit ListingCreated(nextListingId, msg.sender, amount, energyType);
        nextListingId++;
    }

    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not your listing");
        require(listing.active, "Listing already inactive");

        listing.active = false;
        balancesByEnergyType[msg.sender][listing.energyType] += listing.amount;
        emit ListingCancelled(listingId);
    }

    function buyTokens(uint256 listingId, uint256 amount) external {
        require(buyers[msg.sender].approved, "Not an approved buyer");

        Listing storage listing = listings[listingId];
        require(listing.active, "Listing inactive");
        require(listing.amount >= amount, "Insufficient tokens in listing");

        listing.amount -= amount;
        if (listing.amount == 0) {
            listing.active = false;
        }

        balancesByEnergyType[msg.sender][listing.energyType] += amount;

        // Add transaction history for both buyer and seller
        sellingHistory[listing.seller].push(TransactionHistory({
            counterparty: msg.sender,
            amount: amount,
            price: listing.price,
            energyType: listing.energyType,
            timestamp: block.timestamp
        }));

        buyingHistory[msg.sender].push(TransactionHistory({
            counterparty: listing.seller,
            amount: amount,
            price: listing.price,
            energyType: listing.energyType,
            timestamp: block.timestamp
        }));

        emit RECBought(msg.sender, listingId, amount);
    }

    function getBuyingHistory(address buyer) external view returns (TransactionHistory[] memory) {
        return buyingHistory[buyer];
    }

    function getSellingHistory(address seller) external view returns (TransactionHistory[] memory) {
        return sellingHistory[seller];
    }

    function setMinimumTradeAmount(uint256 amount) external onlyOwner {
        minTradeAmount = amount;
    }

    // New Functions
    function getActiveListings() external view returns (Listing[] memory) {
        uint256 count;
        for (uint256 i = 1; i < nextListingId; i++) {
            if (listings[i].active) {
                count++;
            }
        }

        Listing[] memory activeListings = new Listing[](count);
        uint256 index;
        for (uint256 i = 1; i < nextListingId; i++) {
            if (listings[i].active) {
                activeListings[index] = listings[i];
                index++;
            }
        }
        return activeListings;
    }

    function buyTokensByEnergyType(string memory energyType, uint256 amount) external {
        require(buyers[msg.sender].approved, "Not an approved buyer");
        uint256 totalPurchased;

        for (uint256 i = 1; i < nextListingId && totalPurchased < amount; i++) {
            Listing storage listing = listings[i];

            if (listing.active && keccak256(bytes(listing.energyType)) == keccak256(bytes(energyType))) {
                uint256 purchaseAmount = amount - totalPurchased;

                if (listing.amount <= purchaseAmount) {
                    purchaseAmount = listing.amount;
                    listing.active = false;
                } else {
                    listing.amount -= purchaseAmount;
                }

                totalPurchased += purchaseAmount;
                balancesByEnergyType[msg.sender][energyType] += purchaseAmount;

                // Add transaction history for buyer and seller
                sellingHistory[listing.seller].push(TransactionHistory({
                    counterparty: msg.sender,
                    amount: purchaseAmount,
                    price: listing.price,
                    energyType: energyType,
                    timestamp: block.timestamp
                }));


                buyingHistory[msg.sender].push(TransactionHistory({
                    counterparty: listing.seller,
                    amount: purchaseAmount,
                    price: listing.price,
                    energyType: energyType,
                    timestamp: block.timestamp
                }));

                emit RECBought(msg.sender, listing.id, purchaseAmount);
            }
        }

        require(totalPurchased == amount, "Insufficient tokens available for the requested energy type");
    }

    function getBalanceInTokensByEnergyType(address account) external view returns (uint256[] memory balances, string[] memory energyTypes) {
        uint256 count;

        for (uint256 i = 1; i < nextListingId; i++) {
            if (balancesByEnergyType[account][listings[i].energyType] > 0) {
                count++;
            }
        }

        balances = new uint256[](count);
        energyTypes = new string[](count);
        uint256 index;

        for (uint256 i = 1; i < nextListingId; i++) {
            if (balancesByEnergyType[account][listings[i].energyType] > 0) {
                balances[index] = balancesByEnergyType[account][listings[i].energyType];
                energyTypes[index] = listings[i].energyType;
                index++;
            }
        }
    }
}
