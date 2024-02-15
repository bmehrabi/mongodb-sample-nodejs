const {MongoClient} = require('mongodb');
const assert = require('assert');

const {URL, DB_NAME} = require('./constants/db');
const circulationRepo = require('./repos/circulationRepo.js');
const data = require('./circulation.json');

async function main() {
    try {
        // Loads data into MongoDB and checks to make sure that all data have been loaded.
        const results = await circulationRepo.loadData(data);
        assert.equal(data.length, results.insertedCount);

        // Asks MongoDB to get all data and checks that it returns all items.
        const getData = await circulationRepo.get();
        assert.equal(getData.length, data.length);

        // Searches on MongoDB to get an item by ID.
        const sampleItem = getData[4];
        const filterData = await circulationRepo.get({Newspaper: sampleItem.Newspaper});
        assert.deepEqual(filterData[0], sampleItem);

        // Queries MongoDB by passing limit and checks that it returns only three items.
        const limitData = await circulationRepo.get({}, 3);
        assert.equal(limitData.length, 3);

        // Queries MongoDB by passing limit and checks that it returns only three items.
        const id = sampleItem._id.toString();
        const byId = await circulationRepo.getById(id);
        assert.deepEqual(byId, sampleItem);

        // Adds a new item to MongoDB and test to see if the added item has been inserted properly.
        const newItem = {
            "Newspaper": "New Newspaper Item",
            "Daily Circulation, 2004": 1000,
            "Daily Circulation, 2013": 2000,
            "Change in Daily Circulation, 2004-2013": 67,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 1,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 2
        };
        const addedItemId = await circulationRepo.add(newItem);
        assert(addedItemId);
        const addedItem = await circulationRepo.getById(addedItemId);
        assert.deepEqual(addedItem, newItem);

        // Updates the previously inserted item.
        await circulationRepo.update(addedItem._id, {
            "Newspaper": "Updated Newspaper Item",
            "Daily Circulation, 2004": 1000,
            "Daily Circulation, 2013": 2000,
            "Change in Daily Circulation, 2004-2013": 67,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 1,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 2
        });
        const updatedItem = await circulationRepo.getById(addedItemId);
        assert.equal(updatedItem.Newspaper, "Updated Newspaper Item");

        // Removes the item from MongoDB and make sures that there is no record with this ID.
        const removed = await circulationRepo.remove(addedItem._id);
        assert(removed);
        const removedItem = await circulationRepo.getById(addedItemId);
        assert.equal(removedItem, null);

    } catch(error) {
        console.log(error);
    } finally {
        const client = new MongoClient(URL);
        await client.connect();
        const admin = client.db(DB_NAME).admin();

        client.db(DB_NAME).dropDatabase();
        console.log(await admin.listDatabases());

        client.close();
    }
}

main();

