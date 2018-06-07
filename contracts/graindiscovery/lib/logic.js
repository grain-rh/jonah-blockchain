/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* global getAssetRegistry getParticipantRegistry */

'use strict';
/**
 * Write your transction processor functions here
 */

/**
 * Sample transaction
 * @param {org.graindiscovery.SampleTransaction} sampleTransaction
 * @transaction
 */
async function sampleTransaction(tx) {
    // Save the old value of the asset.
    const oldValue = tx.asset.value;

    // Update the asset with the new value.
    tx.asset.value = tx.newValue;

    // Get the asset registry for the asset.
    const assetRegistry = await getAssetRegistry('org.graindiscovery.SampleAsset');
    // Update the asset in the asset registry.
    await assetRegistry.update(tx.asset);

    // Emit an event for the modified asset.
    let event = getFactory().newEvent('org.graindiscovery', 'SampleEvent');
    event.asset = tx.asset;
    event.oldValue = oldValue;
    event.newValue = tx.newValue;
    emit(event);
}

/**
 * Make an Offer for a VehicleListing
 * @param {org.graindiscovery.fillBid} fill - the offer
 * @transaction
 */
async function fillBid(fill) {
  let grain = fill.grain;
  let grainSeller = fill.member;
  let bid = fill.bid;
  let bidder = fill.bid.owner;
  
  if (bid.state !== 'FOR_SALE') {
        throw new Error('Bid Not Active');
	}
  
  if (bidder.balance < bid.value)
  {
    throw new Error('Insufficent balance for transaction');
  }
  
   grainSeller.balance = grainSeller.balance + bid.value;
   bidder.balance = bidder.balance - bid.value;
   grain.state = 'SOLD';
   grain.owner = bidder;
   bid.state = 'SOLD';
  
  const grainRegistry = await getAssetRegistry('org.graindiscovery.Grain');
     await grainRegistry.update(grain);
  
  const bidRegistry = await getAssetRegistry('org.graindiscovery.Bid');
     await grainRegistry.update(bid);
  
  const userRegistry = await getParticipantRegistry('org.graindiscovery.Member');
     await userRegistry.update(bidder);
     await userRegistry.update(grainSeller);

}

/**
 * Fill an ask
 * @param {org.graindiscovery.fillAsk} ask - the offer
 * @transaction
 */
async function fillAsk(ask) {
  
  let grain = ask.grain;
  let grainOwner = grain.owner;
  let asker = ask.member;
  
  console.log('#### Askers Balance: ' + ask.member.balance);
  console.log('#### Grain Owner balance: ' + ask.grain.owner.balance);
  console.log('#### Grain Value: ' + ask.grain.value);
  console.log('#### Grain Owner Balance: ' + ask.member.balance);
  
  if (grain.state !== 'FOR_SALE') {
        throw new Error('Grain is not FOR SALE');
  }
  
  if (grain.value > asker.balance)
  {
    throw new Error('Insufficent balance for transaction');
  }
  
  grainOwner.balance = grainOwner.balance + grain.value;
  asker.balance = asker.balance - grain.value;
  grain.owner = asker;
  grain.state = 'SOLD';

  const grainRegistry = await getAssetRegistry('org.graindiscovery.Grain');
    await grainRegistry.update(grain);
  
  const userRegistry = await getParticipantRegistry('org.graindiscovery.Member');
    await userRegistry.update(asker);
    await userRegistry.update(grainOwner);
    
}


