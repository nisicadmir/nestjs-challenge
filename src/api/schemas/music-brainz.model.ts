import { ITrack } from './track.model';

export interface IMusicBrainzResponse {
  media: IMusicBrainzMedia[];
}

export interface IMusicBrainzMedia {
  tracks: ITrack[]; // We will use same model from ITrack
}
