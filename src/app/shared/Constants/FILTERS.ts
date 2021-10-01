export const SeasonsFilters: {} = {
  Premium: ['Yes', 'No'],
  'Containing Tournaments': [
    'Freekyk Knockout Championship',
    'Freekyk Premier League',
    'Freekyk Community Play',
  ],
};
export const PlayersFilters = {
  Gender: ['Male', 'Female'],
};
export const TeamsFilters = {
  Verified: ['Yes', 'No'],
};
export const MatchFilters = {
  Premium: ['Yes', 'No'],
  'Tournament Type': [
    'Freekyk Knockout Championship',
    'Freekyk Premier League',
    'Freekyk Community Play',
  ],
};
export const StandingsFilters = {
  ABC: [],
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
  Owner: 'own_type',
  'Field Type': 'fieldType',
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