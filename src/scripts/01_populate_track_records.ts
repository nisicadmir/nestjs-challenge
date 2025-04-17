import axios from 'axios';
import { AppConfig } from '../app.config';
import { Collection, MongoClient } from 'mongodb';
import { IMusicBrainzResponse } from '../api/schemas/music-brainz.model';
import { ITrack } from '../api/schemas/track.model';
/**
 * This script populates the track field for records with MBID.
 * It uses the MusicBrainz API to fetch the track data.
 * It uses the MongoDB client to connect to the database.
 * It uses the axios library to make the HTTP request.
 *
 * For each iteam in the database which does not have tracks property and which has mbid it will fetch tracks and save it into the database.
 */

const mongoUri = AppConfig.mongoUrl;

const BATCH_SIZE = 100;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const RATE_LIMIT_DELAY = 1100; // 1.1 seconds - MusicBrainz allows ~1 request per second

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to fetch track data with retries
const fetchTrackData = async (mbid: string, retryCount = 0): Promise<any> => {
  try {
    const response = await axios.get(
      `https://musicbrainz.org/ws/2/release/${mbid}?fmt=json&inc=recordings+artist-credits`,
      {
        validateStatus: null, // This ensures axios doesn't throw on non-2xx status
      },
    );

    // Check status code explicitly
    if (response.status === 200) {
      return response.data;
    }

    // Handle different status codes
    switch (response.status) {
      case 404:
        throw new Error(`MBID ${mbid} not found in MusicBrainz`);
      case 429:
        // Rate limit hit - wait longer and retry
        await delay(RATE_LIMIT_DELAY * 2);
        if (retryCount < MAX_RETRIES) {
          return fetchTrackData(mbid, retryCount + 1);
        }
        throw new Error(`Rate limit exceeded after ${MAX_RETRIES} retries`);
      case 503:
        // Service unavailable - wait and retry
        await delay(RETRY_DELAY * (retryCount + 1));
        if (retryCount < MAX_RETRIES) {
          return fetchTrackData(mbid, retryCount + 1);
        }
        throw new Error(`Service unavailable after ${MAX_RETRIES} retries`);
      default:
        throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Error response from MusicBrainz for MBID ${mbid}:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error(`No response received for MBID ${mbid}:`, error.message);
    } else {
      // Something happened in setting up the request
      console.error(
        `Error setting up request for MBID ${mbid}:`,
        error.message,
      );
    }

    // Retry logic for network errors
    if (retryCount < MAX_RETRIES) {
      await delay(RETRY_DELAY * (retryCount + 1));
      return fetchTrackData(mbid, retryCount + 1);
    }

    throw error;
  }
};

// We need to paginate trough all records. For each reacord we need to find tracks from musicbrainz.org and attach to items.
const paginateRecords = async (collection: Collection) => {
  let lastId = null;
  let hasMore = true;
  let totalProcessed = 0;
  let successCount = 0;
  let errorCount = 0;

  while (hasMore) {
    // We need only those which track is not set and where mbid exists
    const query = lastId
      ? {
          $and: [
            { _id: { $gt: lastId } },
            { tracks: { $exists: false } },
            { mbid: { $exists: true } },
          ],
        }
      : {
          $and: [{ tracks: { $exists: false } }, { mbid: { $exists: true } }],
        };

    const records = await collection
      .find(query)
      .sort({ _id: 1 })
      .limit(BATCH_SIZE)
      .toArray();

    if (records.length > 0) {
      console.log(`Processing batch of ${records.length} records...`);

      // Process records sequentially to respect rate limits
      for (const record of records) {
        try {
          console.log(
            `Processing record: ${record._id} with MBID: ${record.mbid}`,
          );

          if (!record.mbid) {
            console.warn(`Skipping record ${record._id} - no MBID found`);
            continue;
          }

          // Wait for rate limit before making request
          await delay(RATE_LIMIT_DELAY);

          const trackData: IMusicBrainzResponse = await fetchTrackData(
            record.mbid,
          );

          const tracks: ITrack[] = [];
          for (const media of trackData.media) {
            for (const track of media.tracks) {
              tracks.push(track);
            }
          }

          await collection.updateOne(
            { _id: record._id },
            { $set: { tracks: tracks } },
          );

          successCount++;

          console.log(`Successfully processed MBID: ${record.mbid}`);
          console.log('\n');

          // Here you can process trackData further...
        } catch (error) {
          errorCount++;
          console.error(
            `Failed to process record ${record._id}:`,
            error.message,
          );
          // You might want to store failed records for later retry
        }
      }

      lastId = records[records.length - 1]._id;
      totalProcessed += records.length;
    }

    hasMore = records.length === BATCH_SIZE;

    console.log(
      `Progress: ${totalProcessed} records processed (${successCount} successful, ${errorCount} failed)`,
    );
  }

  console.log(`
    Processing complete:
    - Total processed: ${totalProcessed}
    - Successful: ${successCount}
    - Failed: ${errorCount}
  `);
};

const init = async () => {
  let client: MongoClient;
  try {
    client = await MongoClient.connect(mongoUri);
    console.log('Connected to MongoDB', mongoUri);

    const collection = client.db('records').collection('records');
    await paginateRecords(collection);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
};

init();
