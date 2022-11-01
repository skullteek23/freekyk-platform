import { PLAYING_POSITIONS_LIST } from './PLAYING_POSITIONS';

export const SeasonsFilters: {} = {
  Premium: ['Yes', 'No'],
  'Containing Tournaments': [
    'Freekyk Community Play',
    'Freekyk Knockout Championship',
    'Freekyk Premier League',
  ],
  Status: ['Live', 'Finished']
};
export const PlayersFilters = {
  Gender: ['Male', 'Female'],
};
export const TeamsFilters = {
  Verified: ['Yes', 'No'],
};
export const TeamMemberListFilter = {
  'Playing Position': PLAYING_POSITIONS_LIST,
};
export const MatchFilters = {
  Premium: ['Yes', 'No'],
  'Tournament Type': [
    'Freekyk Community Play',
    'Freekyk Knockout Championship',
    'Freekyk Premier League',
  ],
  Season: []
};
export const StandingsFilters = {
  Season: [],
};
export const GroundsFilters = {
  Owner: ['Freekyk', 'Public', 'Private'],
  'Field Type': [
    'Soft Ground',
    'Futsal Ground',
    'Hard Ground',
    'Artifical Ground',
    'Turf',
  ],
};

export const FilterHeadingMap = {
  Premium: 'premium',
  Location: 'locCity',
  'Containing Tournaments': 'cont_tour',
  Team: 'team.name',
  Gender: 'gen',
  Verified: 'isVerified',
  'Age Group': 'tageCat',
  'Tournament Type': 'type',
  Season: 'season',
  Status: 'status',
  Owner: 'own_type',
  'Field Type': 'fieldType',
  'Playing Position': 'pl_pos',
};
export const FilterValueMap = {
  Yes: true,
  No: false,
  'Freekyk Knockout Championship': 'FKC',
  'Freekyk Premier League': 'FPL',
  'Freekyk Community Play': 'FCP',
  Male: 'M',
  Female: 'F',
  Freekyk: 'FK',
  Public: 'PUBLIC',
  Private: 'PRIVATE',
  Live: 'PUBLISHED',
  Finished: 'FINISHED',
  'Soft Ground': 'SG',
  'Futsal Ground': 'FG',
  'Hard Ground': 'HG',
  'Artifical Ground': 'AG',
  Turf: 'TURF',
  'U-15': 15,
  'U-19': 19,
  'U-21': 21,
  'U-25': 25,
  'U-30': 30,
};
export const FilterSymbolMap = {
  'Containing Tournaments': 'array-contains',
  'Tournament Type': '',
};
