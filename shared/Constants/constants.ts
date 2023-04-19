import { ListOption } from "@shared/interfaces/others.model";

export class MatchConstants {
  static readonly GROUND_HOURS: number[] = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
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
    MIN: 0,
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
  static readonly ONE_HOUR_IN_MILLIS = 3600000;
  static readonly THREE_DAY_IN_MILLIS = 259200000;
  static readonly ONE_WEEK_IN_MILLIS = 604800000;
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
  static readonly RESCHEDULE_MINIMUM_GAP_MILLISECONDS = 86400000; // 24 Hours
  static readonly SEASON_CANCELLATION_ONT_PERCENTAGE_MODIFIER = 0.8 // 80 %
  static readonly CANCELLATION_FIRST_N_MATCHES = 3;
  static readonly MINIMUM_PAYMENT_AMOUNT = 150;
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

export const MATCH_CANCELLATION_REASONS = [
  'Both teams did not participate',
  'Ground was not available',
  'Weather / Ground Condition',
  'Uncertain Events',
  'Other Reason'
];

export const MATCH_ABORT_REASONS = [
  'Uncertain Events',
  'Other Reason'
];

export const SEASON_CANCELLATION_REASONS = [
  'Low Participation',
  'Ground unavailability',
  'Bad Weather',
  'Other Reason'
];

export class ProfileConstants {
  static readonly MAX_BIRTH_DATE_ALLOWED = '31 December 2015';
  static readonly BIO_MAX_LIMIT = 129;
  static readonly TEAM_DESC_MAX_LIMIT = 300;
  static readonly ASK_QUESTION_TITLE = 200;
  static readonly TEAM_SLOGAN_MAX_LIMIT = 50;
  static readonly MIN_TEAM_CREATION_ELIGIBLE_PLAYER_LIMIT = 0;
  static readonly MIN_TEAM_PARTICIPATION_ELIGIBLE_PLAYER_LIMIT = 6;
  static readonly MAX_TEAM_ELIGIBLE_PLAYER_LIMIT = 15;
  static readonly SUPPORT_QUERY_LIMIT = 1000;
  static readonly DEACTIVATION_REASON_LIMIT = 500;
  static readonly FALLBACK_IMG_URL = 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png';
  static readonly FEEDBACK_MESSAGE_LIMIT = 3000;
  static readonly RATING_NUMBERS = [0, 1, 2, 3, 4, 5];
  static readonly ALLOWED_PHOTO_FILE_TYPES_TEAM = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/tiff',
    'image/webp',
    'image/gif',
  ]
}

export class TeamConstants {
  static readonly PLACEHOLDER_TEAM_LOGO = 'https://firebasestorage.googleapis.com/v0/b/freekyk-prod.appspot.com/o/team-media%2Fplaceholder_logo_team.jpg?alt=media&token=8e5566f0-2f03-40a0-988b-a3dea1d631ff';
  static readonly PLACEHOLDER_TEAM_PHOTO = 'https://firebasestorage.googleapis.com/v0/b/freekyk-prod.appspot.com/o/team-media%2Fplaceholder_team.jpg?alt=media&token=fd4acbb9-2187-401b-a723-9411e4dbdd27';
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
  PackageCustom = 'Custom Tournament of 4+ Teams'
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
  STATUS: 'status',
  GROUND: 'ground',
  ACTIONS: 'actions',
};
export const DUMMY_FIXTURE_TABLE_DISPLAY_COLUMNS = {
  MATCH_ID: 'Unique Match ID',
  HOME: 'Home Team',
  AWAY: 'Away Team',
  STATUS: 'Status',
  DATE: 'Date & Time',
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
