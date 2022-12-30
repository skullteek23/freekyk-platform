import { ListOption } from "@shared/interfaces/others.model";

export class MatchConstants {
  static readonly GROUND_HOURS: number[] = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  static readonly DAYS_LIST_FULL = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  // match duration and on-field operations should finish within 1 hour
  static readonly ONE_MATCH_DURATION = 1;
  static readonly MATCH_TYPES = ['FCP', 'FKC', 'FPL'];
  static readonly UNIQUE_MATCH_TYPE_CODES = {
    FKC: 'FK-FKC',
    FCP: 'FK-FCP',
    FPL: 'FK-FPL'
  };
  static readonly TO_BE_DECIDED: 'TBD';
  static readonly ALLOWED_PARTICIPATION_COUNT = [8, 10, 12, 14, 16, 18, 20, 24];
  static readonly ALLOWED_KNOCKOUT_BRACKETS = [4, 8, 16];
  static readonly DEFAULT_LOGO: 'https://www.erithtown.com/wp-content/themes/victory/includes/images/badge-placeholder.png';
  static readonly SEASON_PRICE = {
    MIN: 0,
    MAX: 20000,
  };
  static readonly START_DATE_DIFF = {
    // in milliseconds
    MIN: 1,
    MAX: 90,
  };
  static readonly PARTICIPANTS_COUNT = {
    MIN: 2,
    MAX: 32,
  }
  static readonly LABEL_NOT_AVAILABLE = 'N/A';
  static readonly JOINING_CHARACTER = ', ';
  static readonly LARGE_TEXT_CHARACTER_LIMIT = 2000;
  static readonly ONE_DAY_IN_MILLIS = 86400000;
  static readonly CREATE_TEXT = 'I Want to Create!';
  static readonly GROUND_SLOT_DATE_FORMAT = 'd/M/yy, h a'; // results in `15/6/21, 9 AM`
  static readonly TEAM_ACTIVITY_DATE_FORMAT = 'd/M/yy, hh:mm a'; // results in `15/6/21, 9 AM`
  static readonly GROUND_CONTRACT_DATE_FORMAT = 'd/M/yy'; // results in `15/6/21, 9 AM`
  static readonly NOTIFICATION_DATE_FORMAT = 'd MMM, h:mm aa'; // results in `15/6/21, 9 AM`
  static readonly DEFAULT_DASHBOARD_FIXTURES_LIMIT = 6;
  static readonly LINK_NOT_ADDED = 'Unavailable';
  static readonly EMAIL_PASS_CHANGE_TIMEOUT_IN_MILI = 300000;
  static readonly SOCIAL_MEDIA_PRE = {
    ig: 'https://www.instagram.com/',
    fb: 'https://www.facebook.com/',
    tw: 'https://twitter.com/',
    yt: 'https://www.youtube.com/channel/',
    linkedIn: 'https://www.linkedin.com/company/',
  };
}
export const PLAYING_POSITIONS = [
  {
    position: 'Attacker',
    pos_name: ['Striker', 'Left Winger', 'Right Winger', 'Center Forward'],
  },
  {
    position: 'Midfielder',
    pos_name: ['Center Midfielder', 'Right Midfielder', 'Left Midfielder'],
  },
  {
    position: 'Defender',
    pos_name: ['Center Back', 'Left Back', 'Right Back', 'GoalKeeper'],
  },
];
export const PLAYING_POSITIONS_LIST = [
  'Striker',
  'Left Winger',
  'Right Winger',
  'Center Forward',
  'Center Midfielder',
  'Right Midfielder',
  'Left Midfielder',
  'Center Back',
  'Left Back',
  'Right Back',
  'GoalKeeper',
];

export class ProfileConstants {
  static readonly MAX_BIRTH_DATE_ALLOWED = '1 January 2016';
  static readonly BIO_MAX_LIMIT = 129;
  static readonly TEAM_DESC_MAX_LIMIT = 300;
  static readonly TEAM_SLOGAN_MAX_LIMIT = 50;
  static readonly MIN_TEAM_ELIGIBLE_PLAYER_LIMIT = 8;
  static readonly SUPPORT_QUERY_LIMIT = 300;
  static readonly DEACTIVATION_REASON_LIMIT = 500;
  static readonly FALLBACK_IMG_URL = 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png'

}
export const GROUNDS_FEATURES_LIST = {
  referee: 'Referee',
  foodBev: 'Food and Beverages ',
  parking: 'Parking',
  goalpost: 'Goal Post',
  washroom: 'Washroom',
  staff: 'Ball Boy',
};
export enum MATCH_TYPES_PACKAGES {
  PackageOne = 'One match of 2 teams',
  PackageTwo = 'One knockout of 4 Teams',
  PackageThree = 'One league of 4 Teams',
  PackageCustom = 'Full Season of 4+ Teams'
};
export enum DAYS {
  'Sun',
  'Mon',
  'Tues',
  'Wed',
  'Thurs',
  'Fri',
  'Sat',
}
export const STATISTICS = {
  FKC_PLAYED: 'FKC Played',
  FCP_PLAYED: 'FCP Played',
  FPL_PLAYED: 'FPL Played',
  GOALS: 'Goals',
  TOTAL_GOALS: 'Total Goals',
  WINS: 'Wins',
  LOSSES: 'Losses',
  RED_CARDS: 'Red Cards',
  YELLOW_CARDS: 'Yellow Cards',
  GOALS_CONCEDED: 'Goals Conceded',
  APPEARANCES: 'Appearances',
  TOTAL_RED_CARDS: 'Total Red Cards',
  TOTAL_YELLOW_CARDS: 'Total Yellow Cards',
  HIGHEST_GOALSCORER: 'Highest Goal Scorer',
};
export const MatchConstantsSecondary = {
  TO_BE_DECIDED: 'TBD',
  DEFAULT_LOGO: 'https://www.erithtown.com/wp-content/themes/victory/includes/images/badge-placeholder.png',
  DEFAULT_PLACEHOLDER: 'https://www.littlethings.info/wp-content/uploads/2014/04/dummy-image-green-e1398449160839.jpg',
  DEFAULT_IMAGE_URL: 'https://www.littlethings.info/wp-content/uploads/2014/04/dummy-image-green-e1398449160839.jpg'
};

export const DUMMY_FIXTURE_TABLE_COLUMNS = {
  MATCH_ID: 'id',
  HOME: 'home',
  AWAY: 'away',
  DATE: 'date',
  LOCATION: 'location',
  GROUND: 'ground',
  ACTIONS: 'actions',
};
export const DUMMY_FIXTURE_TABLE_DISPLAY_COLUMNS = {
  MATCH_ID: 'Unique Match ID',
  HOME: 'Home Team',
  AWAY: 'Away Team',
  DATE: 'Date & Time',
  LOCATION: 'Location',
  GROUND: 'Ground',
};

export const DELETE_SEASON_SUBHEADING =
  `Deletion request will disable all <strong>update match data</strong> button for you. Please provide us the reason below: [max characters: 1000]`;

export const REVOKE_MATCH_UPDATE_SUBHEADING =
  `Please note that reverting the match update will revert all the numbers shown in match summaries. please provide us the reason below: [max characters: 1000]`;

export const UNIQUE_DELETION_REQUEST_CODE = 'FK-SEASON';

export enum LOADING_STATUS {
  DEFAULT,
  LOADING,
  DONE
}

export const YES_OR_NO_OPTIONS: ListOption[] = [
  { value: true, viewValue: 'Yes' },
  { value: false, viewValue: 'No' }
]
