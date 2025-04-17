import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { IMusicBrainzResponse } from '../schemas/music-brainz.model';
import { ITrack } from '../schemas/track.model';

@Injectable()
export class RecordService {
  async getMusicBrainzData(mbid: string): Promise<ITrack[]> {
    try {
      const tracks: ITrack[] = [];
      const url = `https://musicbrainz.org/ws/2/release/${mbid}?fmt=json&inc=recordings+artist-credits`;
      const response = await axios.get(url);
      (<IMusicBrainzResponse>response.data).media.forEach((media) => {
        const tracksExtracted = media.tracks.map((track) => ({
          title: track.title,
          position: track.position,
          length: track.length,
        }));
        tracks.push(...tracksExtracted);
      });
      return tracks;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to get musicbrainz data',
        error,
      );
    }
  }
}
