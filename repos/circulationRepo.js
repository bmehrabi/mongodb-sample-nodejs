const { MongoClient, ObjectId } = require('mongodb');
const {URL, DB_NAME} = require('../constants/db');

function circulationRepo() {
    /**
     * Initate the database connection.
     * @returns A Promise which will be resolved to client instance and db instance.
     */
    async function initDatabaseConnection() {
        return new Promise(async (resolve) => {
            const client = new MongoClient(URL);

            await client.connect();
            const db = client.db(DB_NAME);

            resolve({client, db});
        });
    }

    /**
     * Loads the data into the database.
     * @param {object} data Objects which will be inserted into database.
     * @returns A Promise which will be resolved to the inserted items.
     */
    const loadData = (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                const {client, db} = await initDatabaseConnection();

                results = await db.collection('newspaper').insertMany(data);

                resolve(results);
                client.close();
            } catch(error) {
                reject(error);
            }
        });
    }

    /**
     * Get data from database based on query and limit.
     * @param {string=} query Query string.
     * @param {number=} limit Limits the number of returned records.
     * @returns A Promise which will be resolved to the fetched items.
     */
    const get = (query, limit) => {
        return new Promise(async (resolve, reject) => {
            try {
                const {client, db} = await initDatabaseConnection();

                let items = await db.collection('newspaper').find(query);

                if (limit > 0) {
                    items = items.limit(limit);
                }

                resolve(await items.toArray());
                client.close();
            } catch(error) {
                reject(error);
            }
        });
    }

    /**
     * Fetches an item from the database by ID.
     * @param {number} id Object id.
     * @returns A Promise which will be resolved to the fetched item.
     */
    const getById = (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const {client, db} = await initDatabaseConnection();

                let item = await db.collection('newspaper').findOne({_id: new ObjectId(id)});

                resolve(item);
                client.close();
            } catch(error) {
                reject(error);
            }
        });
    }

    /**
     * Adds an item to the database.
     * @param {object} item The object which will be inserted into database.
     * @returns A Promise which will be resolved to the inserted item ID.
     */
    const add = (item) => {
        return new Promise(async (resolve, reject) => {
            try {
                const {client, db} = await initDatabaseConnection();

                const addedItem = await db.collection('newspaper').insertOne(item);

                resolve(addedItem.insertedId);
                client.close();
            } catch(error) {
                reject(error);
            }
        });
    }

    /**
     * Updates a record in database based on its Id to the new object.
     * @param {number} id Object id.
     * @param {object} newItem The new Object which will be replaced.
     * @returns A Promise which will be resolved to the fetched item.
     */
    const update = (id, newItem) => {
        return new Promise(async (resolve, reject) => {
            try {
                const {client, db} = await initDatabaseConnection();

                const updatedItem = await db.collection('newspaper')
                .findOneAndReplace({_id: new ObjectId(id)}, newItem);

                resolve(updatedItem);
                client.close();
            } catch(error) {
                reject(error);
            }
        });
    }

    /**
     * Remvoes an item from the database by id.
     * @param {number} id Object id.
     * @returns A Promise which will be resolved to `True` if operation was successful. Otherweise, to `False`.
     */
    const remove = (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const {client, db} = await initDatabaseConnection();

                const removedItems = await db.collection('newspaper').deleteOne({_id: new ObjectId(id)});

                resolve(removedItems);
                client.close();
            } catch(error) {
                reject(error);
            }
        });
    }

    return {loadData, get, getById, add, update, remove};
}

module.exports = circulationRepo();