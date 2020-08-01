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
import { FileEntity, UserEntity, SubscriptionEntity } from "../generated/schema";

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

//    uint256 indexed streamId,
//         address indexed sender,
//         address indexed recipient,
//         uint256 deposit,
//         address tokenAddress,
//         uint256 startTime,
//         uint256 stopTime


export function handleCreateStream(event: CreateStream): void {
 let contract = Contract.bind(event.address);
 
 let subscription = SubscriptionEntity.load(event.params.streamId.toHex());
  
 let buyerInstance = UserEntity.load(event.params.sender.toHex());
 
 subscription.subscriber = buyerInstance.id
 
 let sellerInstance = UserEntity.load(event.params.recipient.toHex());

 sellerInstance.subscribers = new Array<string>();

 sellerInstance.subscribers.push(buyerInstance.id);
 
 buyerInstance.subscriptions = new Array<string>();
 
 buyerInstance.subscriptions.push(subscription.id)

 subscription.seller = sellerInstance.id
 
 subscription.startTime = event.params.startTime;
 
 subscription.stopTime = event.params.stopTime;
 
 subscription.duration = event.params.stopTime.minus(event.params.startTime);
 
 subscription.isActive = contract.isValid(event.params.streamId);
 
 subscription.amount = event.params.deposit;
 
 subscription.paymentRate = event.params.deposit.div(event.params.stopTime.minus(event.params.startTime));
 
 subscription.balance = event.params.deposit;
 
 subscription.save()

 buyerInstance.save()

 sellerInstance.save()

}


export function handleWithdrawFromStream(event: WithdrawFromStream): void {
 let contract = Contract.bind(event.address);
 
 let subscription = SubscriptionEntity.load(event.params.streamId.toHex());
 
 subscription.balance = subscription.balance.minus(event.params.amount)

 subscription.amount = event.params.amount;
  
 subscription.save()
}

    // event CancelStream(
    //     uint256 indexed streamId,
    //     address indexed sender,
    //     address indexed recipient,
    //     uint256 senderBalance,
    //     uint256 recipientBalance
    // );

export function handleCancelStream(event: CancelStream): void {
 let contract = Contract.bind(event.address);
 
 let subscription = SubscriptionEntity.load(event.params.streamId.toHex());
 
 subscription.balance = BigInt.fromI32(0);

 subscription.isActive = false;

 let buyerInstance = UserEntity.load(event.params.sender.toHex());

 let sellerInstance = UserEntity.load(event.params.recipient.toHex());

 // assigning here since assembly ts gives compile issue
 let subscriptions = buyerInstance.subscriptions

 let subscribers = sellerInstance.subscribers

 // removing the subscribers & the subscriptions from the array in user entity after stream is cancelled
 for (var i = 0; i < buyerInstance.subscriptions.length; i ++) {
     if (subscriptions[i].includes(subscription.id)) buyerInstance.subscriptions.splice(i, 1)
 }

 for (var j = 0; j < sellerInstance.subscribers.length; j ++) {
     if (subscribers[j].includes(buyerInstance.id)) sellerInstance.subscribers.splice(j, 1)
 }
   
 subscription.save();

 buyerInstance.save();

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