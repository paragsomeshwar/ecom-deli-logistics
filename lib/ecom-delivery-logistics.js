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

/**
 * Transaction processor function for new shipments
 * @param {com.ecdellog.delivery.ShipParcel} tx The transaction instance.
 * @transaction
 */
function shipParcel(tx) {

     // Update the status of the parcel
     console.log('in shipParcel() tx.parcel.$identifier=' + tx.parcel.$identifier + ';');
     console.log('in shipParcel() tx.parcel.parcelStatus=' + tx.parcel.parcelStatus + ';');
     console.log('in shipParcel() tx.parcel.courierId=' + tx.parcel.courier.$identifier + ';');
     console.log('in shipParcel() tx.parcel.receiverId=' + tx.parcel.receiver.$identifier + ';');
 
    // Get the asset registry for the asset.
    return getAssetRegistry('com.ecdellog.delivery.Parcel')
        .then(function (assetRegistry) {
            tx.parcel.parcelStatus = 'READY_FOR_PICKUP';            
            // Update the asset in the asset registry.
            console.log('Changed status of parcel: ' + tx.parcel.$identifier + '; to ' + tx.parcel.parcelStatus + '#');
            return assetRegistry.update(tx.parcel);
        })
        .catch(function (error) {
            console.log('Got error=' + error);
          });/**
        .then(function () {

            // Emit an event for the modified asset.
            var event = getFactory().newEvent('com.ecdellog.delivery', 'DeliveryEvent');
            event.parcelId = tx.parcel.parcelId;
            event.value = "READY_FOR_PICKUP";
            emit(event);

        })*/;

}
