import { BigInt } from "@graphprotocol/graph-ts";
import {
    StorageMarketPlace,
    Buy,
    Sell,
    SubscriptionInfoUpdated,
    SubscriptionCreated,
    SubscriptionWithdrawal,
    SubscriptionCancelled
} from "../generated/StorageMarketPlace/StorageMarketPlace";
import { File, User, Stream } from "../generated/schema";

export function handleSell(event: Sell): void {
    let contract = StorageMarketPlace.bind(event.address);
    let fileId = event.params.fileId;
    let seller = event.params.seller;
    let fileObject = contract.Files(fileId);

    let file = new File(fileId.toHex());
    file.metadataHash = fileObject.value2;

    let user = User.load(seller.toHex());
    if (user == null) {
        user = new User(seller.toHex());
        user.address = seller;
        user.filesBought = new Array<string>();
        user.filesOwned = new Array<string>();
        user.subscribers = new Array<string>();
        user.subscriptions = new Array<string>();
        user.isEnabled = false;
    }
    let ownedFiles = user.filesOwned;
    ownedFiles.push(file.id);
    user.filesOwned = ownedFiles;
    user.save();

    file.seller = user.id;
    file.price = fileObject.value3;
    file.priceAsset = fileObject.value1;
    file.buyers = new Array<string>();
    file.numBuys = BigInt.fromI32(0);
    file.save();
}

export function handleBuy(event: Buy): void {
    let contract = StorageMarketPlace.bind(event.address);
    let fileId = event.params.fileId;
    let buyer = event.params.buyer;
    let fileObject = contract.Files(fileId);

    let file = File.load(fileId.toHex());

    let user = User.load(buyer.toHex());
    if (user == null) {
        user = new User(buyer.toHex());
        user.address = buyer;
        user.filesBought = new Array<string>();
        user.filesOwned = new Array<string>();
        user.subscribers = new Array<string>();
        user.subscriptions = new Array<string>();
        user.isEnabled = false;
    }
    let boughtFiles = user.filesBought;
    boughtFiles.push(file.id);
    user.filesBought = boughtFiles;
    user.save();

    let buyers = file.buyers;
    buyers.push(user.id);
    file.buyers = buyers;
    file.numBuys = file.numBuys + BigInt.fromI32(1);
    file.save();
}

export function handleSubscriptionCreated(event: SubscriptionCreated): void {
    let contract = StorageMarketPlace.bind(event.address);

    let subscription = Stream.load(event.params.streamId.toHex());
    if (subscription == null) {
        subscription = new Stream(event.params.streamId.toHex());
    }

    let buyerInstance = User.load(event.params.buyer.toHex());
    if (buyerInstance == null) {
        buyerInstance = new User(event.params.buyer.toHex());
        buyerInstance.address = event.params.buyer;
        buyerInstance.filesBought = new Array<string>();
        buyerInstance.filesOwned = new Array<string>();
        buyerInstance.subscribers = new Array<string>();
        buyerInstance.subscriptions = new Array<string>();
    }

    let sellerInstance = User.load(event.params.seller.toHex());
    if (sellerInstance == null) {
        sellerInstance = new User(event.params.seller.toHex());
        sellerInstance.address = event.params.seller;
        sellerInstance.filesBought = new Array<string>();
        sellerInstance.filesOwned = new Array<string>();
        sellerInstance.subscribers = new Array<string>();
        sellerInstance.subscriptions = new Array<string>();
    }

    let stream = contract.getStream(event.params.streamId);

    /* address sender, value0 */

    /* address recipient, value1 */
    /* uint256 deposit, value2 */
    /* address tokenAddress, value3 */
    /* uint256 startTime, value4 */
    /* uint256 stopTime, value5 */
    /* uint256 remainingBalance, value6 */
    /* uint256 ratePerSecond value7 */

    subscription.subscriber = buyerInstance.id;
    subscription.seller = sellerInstance.id;
    subscription.deposit = stream.value2;
    subscription.tokenAddress = stream.value3;
    subscription.startTime = stream.value4;
    subscription.stopTime = stream.value5;
    subscription.remainingBalance = stream.value6;
    subscription.ratePerSecond = stream.value7;
    subscription.durationInSec = stream.value5.minus(stream.value4);
    subscription.isActive = contract.isValid(event.params.streamId);
    subscription.save();

    let sellerSubscribers = sellerInstance.subscribers;
    sellerSubscribers.push(subscription.id);
    sellerInstance.subscribers = sellerSubscribers;
    sellerInstance.save();

    let buyerSubscriptions = buyerInstance.subscriptions;
    buyerSubscriptions.push(subscription.id);
    buyerInstance.subscriptions = buyerSubscriptions;
    buyerInstance.save();
}

export function handleSubscriptionWithdrawal(
    event: SubscriptionWithdrawal
): void {
    let contract = StorageMarketPlace.bind(event.address);
    let subscription = Stream.load(event.params.streamId.toHex());
    let stream = contract.getStream(event.params.streamId);
    subscription.remainingBalance = stream.value6;
    subscription.isActive = contract.isValid(event.params.streamId);
    subscription.save();
}

export function handleSubscriptionCancelled(
    event: SubscriptionCancelled
): void {
    let contract = StorageMarketPlace.bind(event.address);
    let subscription = Stream.load(event.params.streamId.toHex());
    subscription.remainingBalance = BigInt.fromI32(0);
    subscription.isActive = false;
    subscription.save();

    let buyerInstance = User.load(event.params.buyer.toHex());
    let subscriptions = buyerInstance.subscriptions;
    let subscriptionIndex = subscriptions.indexOf(subscription.id);
    subscriptions.splice(subscriptionIndex, 1);
    buyerInstance.subscriptions = subscriptions;
    buyerInstance.save();

    let sellerInstance = User.load(event.params.seller.toHex());
    let subscribers = sellerInstance.subscribers;
    let subscriberIndex = subscribers.indexOf(buyerInstance.id);
    subscribers.splice(subscriberIndex, 1);
    sellerInstance.subscribers = subscribers;
    sellerInstance.save();
}

export function handleSubscriptionInfoUpdate(
    event: SubscriptionInfoUpdated
): void {
    let contract = StorageMarketPlace.bind(event.address);
    let user = User.load(event.params.seller.toHex());
    if (user == null) {
        user = new User(event.params.seller.toHex());
        user.address = event.params.seller;
        user.filesBought = new Array<string>();
        user.filesOwned = new Array<string>();
        user.subscribers = new Array<string>();
        user.subscriptions = new Array<string>();
        user.isEnabled = false;
    }
    let subscriptionInfo = contract.subscriptions(event.params.seller);
    user.isEnabled = subscriptionInfo.value0;
    user.minDurationInDays = subscriptionInfo.value1;
    user.amountPerDay = subscriptionInfo.value2;
    user.tokenAddress = subscriptionInfo.value3;
    user.save();
}
