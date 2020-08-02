import { BigInt } from "@graphprotocol/graph-ts";
import {
    Contract,
    Buy,
    Sell,
    CreateCompoundingStream,
    PayInterest,
    TakeEarnings,
    UpdateFee,
    Paused,
    Unpaused,
    PauserAdded,
    PauserRemoved,
    OwnershipTransferred,
    CreateStream,
    WithdrawFromStream,
    CancelStream
} from "../generated/Contract/Contract";
import {
    FileEntity,
    UserEntity,
    SubscriptionEntity
} from "../generated/schema";

export function handleSell(event: Sell): void {
    let contract = Contract.bind(event.address);
    let fileId = event.params.fileId;
    let seller = event.params.seller;
    let fileObject = contract.Files(fileId);

    let file = new FileEntity(fileId.toHex());
    file.metadataHash = fileObject.value2;

    let user = UserEntity.load(seller.toHex());
    if (user == null) {
        user = new UserEntity(seller.toHex());
        user.address = seller;
        user.filesBought = new Array<string>();
        user.filesOwned = new Array<string>();
        user.subscribers = new Array<string>();
        user.subscriptions = new Array<string>();
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
    let contract = Contract.bind(event.address);
    let fileId = event.params.fileId;
    let buyer = event.params.buyer;
    let fileObject = contract.Files(fileId);

    let file = FileEntity.load(fileId.toHex());

    let user = UserEntity.load(buyer.toHex());
    if (user == null) {
        user = new UserEntity(buyer.toHex());
        user.address = buyer;
        user.filesBought = new Array<string>();
        user.filesOwned = new Array<string>();
        user.subscribers = new Array<string>();
        user.subscriptions = new Array<string>();
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

export function handleCreateStream(event: CreateStream): void {
    let contract = Contract.bind(event.address);

    let subscription = SubscriptionEntity.load(event.params.streamId.toHex());
    if (subscription == null) {
        subscription = new SubscriptionEntity(event.params.streamId.toHex());
    }

    let buyerInstance = UserEntity.load(event.params.sender.toHex());
    if (buyerInstance == null) {
        buyerInstance = new UserEntity(event.params.sender.toHex());
        buyerInstance.address = event.params.sender;
        buyerInstance.filesBought = new Array<string>();
        buyerInstance.filesOwned = new Array<string>();
        buyerInstance.subscribers = new Array<string>();
        buyerInstance.subscriptions = new Array<string>();
    }

    let sellerInstance = UserEntity.load(event.params.recipient.toHex());
    if (sellerInstance == null) {
        sellerInstance = new UserEntity(event.params.recipient.toHex());
        sellerInstance.address = event.params.recipient;
        sellerInstance.filesBought = new Array<string>();
        sellerInstance.filesOwned = new Array<string>();
        sellerInstance.subscribers = new Array<string>();
        sellerInstance.subscriptions = new Array<string>();
    }

    subscription.subscriber = buyerInstance.id;
    subscription.seller = sellerInstance.id;
    subscription.startTime = event.params.startTime;
    subscription.stopTime = event.params.stopTime;
    subscription.duration = event.params.stopTime.minus(event.params.startTime);
    subscription.isActive = contract.isValid(event.params.streamId);
    subscription.amount = event.params.deposit;
    subscription.tokenAddress = event.params.tokenAddress;
    subscription.paymentRate = event.params.deposit.div(
        event.params.stopTime.minus(event.params.startTime)
    );
    subscription.balance = event.params.deposit;
    subscription.save();

    let sellerSubscribers = sellerInstance.subscribers;
    sellerSubscribers.push(buyerInstance.id);
    sellerInstance.subscribers = sellerSubscribers;
    sellerInstance.save();

    let buyerSubscriptions = buyerInstance.subscriptions;
    buyerSubscriptions.push(subscription.id);
    buyerInstance.subscriptions = buyerSubscriptions;
    buyerInstance.save();
}

export function handleWithdrawFromStream(event: WithdrawFromStream): void {
    let subscription = SubscriptionEntity.load(event.params.streamId.toHex());
    subscription.balance = subscription.balance.minus(event.params.amount);
    subscription.amount = event.params.amount;
    subscription.save();
}

export function handleCancelStream(event: CancelStream): void {
    let subscription = SubscriptionEntity.load(event.params.streamId.toHex());
    subscription.balance = BigInt.fromI32(0);
    subscription.isActive = false;
    subscription.save();

    let buyerInstance = UserEntity.load(event.params.sender.toHex());
    let subscriptions = buyerInstance.subscriptions;
    let subscriptionIndex = subscriptions.indexOf(subscription.id);
    subscriptions.splice(subscriptionIndex, 1);
    buyerInstance.subscriptions = subscriptions;
    buyerInstance.save();

    let sellerInstance = UserEntity.load(event.params.recipient.toHex());
    let subscribers = sellerInstance.subscribers;
    let subscriberIndex = subscribers.indexOf(buyerInstance.id);
    subscribers.splice(subscriberIndex, 1);
    sellerInstance.subscribers = subscribers;
    sellerInstance.save();
}

export function handleCreateCompoundingStream(
    event: CreateCompoundingStream
): void {}

export function handlePayInterest(event: PayInterest): void {}

export function handleTakeEarnings(event: TakeEarnings): void {}

export function handleUpdateFee(event: UpdateFee): void {}

export function handlePaused(event: Paused): void {}

export function handleUnpaused(event: Unpaused): void {}

export function handlePauserAdded(event: PauserAdded): void {}

export function handlePauserRemoved(event: PauserRemoved): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}
