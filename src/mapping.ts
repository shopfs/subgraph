import { Address, BigInt } from "@graphprotocol/graph-ts";
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
    let fileObject = contract.Files(fileId);

    let file = new FileEntity(fileId.toHex());
    file.metadataHash = fileObject.value2;

    let user = UserEntity.load(fileObject.value0.toHex());
    if (user == null) {
        user = new UserEntity(fileObject.value0.toHex());
        user.address = fileObject.value0;
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
    file.save();
}

export function handleBuy(event: Buy): void {}
/*   // Entities can be loaded from the store using a string ID; this ID */
/*   // needs to be unique across all entities of the same type */
/*   let entity = ExampleEntity.load(event.transaction.from.toHex()) */

/*   // Entities only exist after they have been saved to the store; */
/*   // `null` checks allow to create entities on demand */
/*   if (entity == null) { */
/*     entity = new ExampleEntity(event.transaction.from.toHex()) */

/*     // Entity fields can be set using simple assignments */
/*     entity.count = BigInt.fromI32(0) */
/*   } */

/*   // BigInt and BigDecimal math are supported */
/*   entity.count = entity.count + BigInt.fromI32(1) */

/*   // Entity fields can be set based on event parameters */
/*   entity.fileId = event.params.fileId */
/*   entity.buyer = event.params.buyer */

/*   // Entities can be written to the store with `.save()` */
/*   entity.save() */

/*   // Note: If a handler doesn't require existing field values, it is faster */
/*   // _not_ to load the entity from the store. Instead, create it fresh with */
/*   // `new Entity(...)`, set the fields that should be updated and save the */
/*   // entity back to the store. Fields that were not set or unset remain */
/*   // unchanged, allowing for partial updates to be applied. */

/*   // It is also possible to access smart contracts from mappings. For */
/*   // example, the contract that has emitted the event can be connected to */
/*   // with: */
/*   // */
/*   // let contract = Contract.bind(event.address) */
/*   // */
/*   // The following functions can then be called on this contract to access */
/*   // state variables and other data: */
/*   // */
/*   // - contract.getEarnings(...) */
/*   // - contract.nextStreamId(...) */
/*   // - contract.getCompoundingStream(...) */
/*   // - contract.balanceOf(...) */
/*   // - contract.fileCount(...) */
/*   // - contract.isPauser(...) */
/*   // - contract.Files(...) */
/*   // - contract.buyerInfo(...) */
/*   // - contract.paused(...) */
/*   // - contract.sellerToBuyer(...) */
/*   // - contract.sell(...) */
/*   // - contract.cancelStream(...) */
/*   // - contract.withdrawFromStream(...) */
/*   // - contract.createCompoundingStream(...) */
/*   // - contract.getStream(...) */
/*   // - contract.interestOf(...) */
/*   // - contract.owner(...) */
/*   // - contract.isOwner(...) */
/*   // - contract.buyerToSeller(...) */
/*   // - contract.isCompoundingStream(...) */
/*   // - contract.deltaOf(...) */
/*   // - contract.createStream(...) */
/*   // - contract.cTokenManager(...) */
/*   // - contract.buy(...) */
/*   // - contract.fee(...) */
/*   // - contract.priceLimit(...) */
/* } */

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
