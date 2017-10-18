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

'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BrowserFS = require('browserfs/dist/node/index');
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const BusinessNetworkDefinition = require('composer-common').BusinessNetworkDefinition;
const path = require('path');

require('chai').should();

const bfs_fs = BrowserFS.BFSRequire('fs');
const NS = 'com.ecdellog.delivery';

describe('E-Commerce Delivery Logistics', () => {

    // let adminConnection;
    let businessNetworkConnection;

    before(() => {
        BrowserFS.initialize(new BrowserFS.FileSystem.InMemory());
        const adminConnection = new AdminConnection({ fs: bfs_fs });
        return adminConnection.createProfile('defaultProfile', {
            type: 'embedded'
        })
            .then(() => {
                return adminConnection.connect('defaultProfile', 'admin', 'adminpw');
            })
            .then(() => {
                return BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'));
            })
            .then((businessNetworkDefinition) => {
                return adminConnection.deploy(businessNetworkDefinition);
            })
            .then(() => {
                businessNetworkConnection = new BusinessNetworkConnection({ fs: bfs_fs });
                return businessNetworkConnection.connect('defaultProfile', 'ecom-delivery-logistics', 'admin', 'adminpw');
            });
    });

    describe('#shipParcel', () => {

        it('should be able to ship a parcel', () => {
            const factory = businessNetworkConnection.getBusinessNetwork().getFactory();

            // create the Shipper
            const flipkart = factory.newResource(NS, 'Shipper', 'Flipkart');
            flipkart.name = 'Flipkart';
            flipkart.address = 'Gurgaon';

            // create the Courier
            const goJavas = factory.newResource(NS, 'Courier', 'GoJavas');
            goJavas.name = 'GoJavas';
            goJavas.address = 'Noida';

            // create the Receiver
            const parag = factory.newResource(NS, 'Receiver', 'Parag');
            parag.name = 'Parag Someshwar';
            parag.address = 'New Delhi';

            // create the Parcel
            const mobilePhone = factory.newResource(NS, 'Parcel', 'mobilePhone');
            mobilePhone.shipper = factory.newRelationship(NS, 'Shipper', flipkart.$identifier);
            mobilePhone.courier = factory.newRelationship(NS, 'Courier', goJavas.$identifier);
            mobilePhone.receiver = factory.newRelationship(NS, 'Receiver', parag.$identifier);
            mobilePhone.parcelStatus = 'XXX';

            // create the shipParcel transaction
            const ship = factory.newTransaction(NS, 'ShipParcel');
            ship.parcel = factory.newRelationship(NS, 'Parcel', mobilePhone.$identifier);

            // Get the asset registry.
            let parcelRegistry;
            return businessNetworkConnection.getAssetRegistry(NS + '.Parcel')
                .then((assetRegistry) => {
                    parcelRegistry = assetRegistry;
                    // add the commodity to the asset registry.
                    return parcelRegistry.add(mobilePhone);
                })
                .then(() => {
                    return businessNetworkConnection.getParticipantRegistry(NS + '.Shipper');
                })
                .then((participantRegistry) => {
                    // add the traders
                    return participantRegistry.add(flipkart);
                })
                .then(() => {
                    return businessNetworkConnection.getParticipantRegistry(NS + '.Courier');
                })
                .then((participantRegistry) => {
                    // add the traders
                    return participantRegistry.add(goJavas);
                })
                .then(() => {
                    return businessNetworkConnection.getParticipantRegistry(NS + '.Receiver');
                })
                .then((participantRegistry) => {
                    // add the traders
                    return participantRegistry.add(parag);
                })
                .then(() => {
                    // submit the transaction
                    return businessNetworkConnection.submitTransaction(ship);
                })
                .then(() => {
                    // re-get the commodity
                    return parcelRegistry.get(mobilePhone.$identifier);
                })
                .then((newParcel) => {
                    // the status of the parcel should now be READY_FOR_PICKUP
                    console.log ('in test newParcel.$identifier=' + newParcel.$identifier);
                    console.log ('in test newParcel.shipperId=' + newParcel.shipper.$identifier);
                    console.log ('in test newParcel.courierId=' + newParcel.courier.$identifier);
                    console.log ('in test newParcel.receiver=' + newParcel.receiver.$identifier);
                    console.log ('in test newParcel.parcelstatus=' + newParcel.parcelstatus);
                    //newParcel.parcelstatus.should.equal('READY_FOR_PICKUP');
                });
        });
    });
});
