export enum RecordFormat {
  VINYL = 'Vinyl',
  CD = 'CD',
  CASSETTE = 'Cassette',
  DIGITAL = 'Digital',
}

export enum RecordCategory {
  ROCK = 'Rock',
  JAZZ = 'Jazz',
  HIPHOP = 'Hip-Hop',
  CLASSICAL = 'Classical',
  POP = 'Pop',
  ALTERNATIVE = 'Alternative',
  INDIE = 'Indie',
}

// Record can be sorted by these 2 fields, we have to take care about indexes.
export enum RecordSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}
