import { test, mock } from 'node:test';
import assert from 'node:assert';
import command from '../../../commands/utility/selectAnnouncementsChannel.js';

const mockInteraction = {
  client: {
    on: mock.fn((event, callback) => {
      // mock implementation of event listener
    })
  },
  guild: 'mockGuild',
  channel: {
    send: mock.fn((message) => {
      // mock implementation of send
    })
  },
  reply: mock.fn((message) => {
    // mock implementation of reply
  })
};

const mockCollection = {
  updateOne: mock.fn((filter, update, options) => {
    return Promise.resolve();
  })
};

const mockDb = {
  collection: mock.fn(() => mockCollection)
};

const mockMongoClient = {
  connect: mock.fn(() => Promise.resolve()),
  db: mock.fn(() => mockDb),
  close: mock.fn(() => Promise.resolve())
};

const mockMongoClientError = {
  connect: mock.fn(() => Promise.reject(new Error('Connection error'))),
  db: mock.fn(() => mockDb),
  close: mock.fn(() => Promise.resolve())
};

await test('top level test for selectAnnouncementsChannel', async (t) => {
  await t.test('should connect to MongoDB and update the collection', async () => {
    // Switching real mongo client with the mock one
    const original_mongo = global.mongo_client;
    global.mongo_client = mockMongoClient;
    // Awaiting the execution of `execute`
    const m_execute = mock.fn(await command.execute(mockInteraction));
    // Should've been called only once
    assert.strictEqual(m_execute.mock.callCount(), 1);
    // DB has to be called with the right name
    assert.deepStrictEqual(mockMongoClient.db.mock.calls[0].arguments, process.env.MONGO_DB_NAME);
    // Collection has to be called with the right name
    assert.deepStrictEqual(mockMongoClient.db().collection.mock.calls[0].arguments, process.env.MONGO_A_COLLECTION_NAME);
    // Collection has to be called with the right arguments
    assert.deepStrictEqual(mockMongoClient.db().collection().updateOne.mock.calls[0].arguments, [
      { guild: mockInteraction.guild },
      { $set: { channel: mockInteraction.channel } },
      { upsert: true },
    ]);
    // Close has to be call only once
    assert.deepStrictEqual(mockMongoClient.close.mock.callCount, 1);
    // Switching to real client
    global.mongo_client = original_mongo;
  });
  
  await t.test('should handle MongoDB connection error', async () => {
    // Switching real mongo client with the mock one and redirecting console.error
    const originalMongoClient = global.mongo_client;
    const originalConsoleError = console.error;
  
    global.mongo_client = mockMongoClientError;
    let consoleErrorOutput = '';
    console.error = (message) => {
      consoleErrorOutput += message;
    };
  
    // Asserting that function does not throw exceptions
    await assert.doesNotReject(async () => {
      await execute(mockInteraction);
    });
  
    assert.strictEqual(
      mockMongoClient.connect.mock.callCount(),
      1,
      'connect should be called once'
    );
    assert.strictEqual(
      mockMongoClient.close.mock.callCount(),
      1,
      'close should be called once'
    );
    assert.strictEqual(
      consoleErrorOutput.includes('Connection error'),
      true,
      'Connection error should be logged to console'
    );
    // Switching to real client and console.error
    global.mongo_client = originalMongoClient;
    console.error = originalConsoleError;
  });
  
  t.mock.restoreAll();
});