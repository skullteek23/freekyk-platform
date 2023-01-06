import { PLAYING_POSITIONS_LIST } from "@shared/constants/constants";
import { ownershipTypes } from "@shared/interfaces/ground.model";

export const SeasonsFilters: any = {
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
  'Profile Status': ['Active', 'Inactive']
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
  'Select Season': [],
};
export const GroundsFilters = {
  Owner: ownershipTypes,
  'Field Type': [
    'Full Ground',
    'Short Ground',
    'Huge Ground',
    'Agile Ground',
    'Football Turf',
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
  Owner: 'ownType',
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
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  Live: 'PUBLISHED',
  Finished: 'FINISHED',
  'Full Ground': 'FG',
  'Short Ground': 'SG',
  'Huge Ground': 'HG',
  'Agile Ground': 'AG',
  'Football Turf': 'TURF',
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
