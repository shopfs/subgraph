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
import { FileEntity, UserEntity } from "../generated/schema";

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

export function handleCreateStream(event: CreateStream): void {}

export function handleWithdrawFromStream(event: WithdrawFromStream): void {}

export function handleCancelStream(event: CancelStream): void {}
