import { environment } from "src/environments/environment";

export class MatchConstants {
  public static GROUND_HOURS: number[] = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
  public static DAYS_LIST: string[] = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
  public static DAYS_LIST_FULL = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  // match duration and on-field operations should finish within 1 hour
  public static ONE_MATCH_DURATION = 1;
  public static MATCH_TYPES = ['FCP', 'FKC', 'FPL'];
  public static UNIQUE_MATCH_TYPE_CODES = {
    FKC: 'FK-FKC',
    FCP: 'FK-FCP',
    FPL: 'FK-FPL'
  }
  public static TO_BE_DECIDED: 'TBD';
  public static ALLOWED_PARTICIPATION_COUNT = [2, 4, 8, 10, 12, 14, 16, 18, 20, 24];
  public static DEFAULT_LOGO: 'https://www.erithtown.com/wp-content/themes/victory/includes/images/badge-placeholder.png'
  public static SEASON_PRICE = {
    MIN: 0,
    MAX: 20000,
  }
  public static START_DATE_DIFF = {
    MIN: 1,
    MAX: 365,
  }
  public static SEASON_URL = environment?.firebase?.url + '/s/';
}
export const MatchConstantsSecondary = {
  TO_BE_DECIDED: 'TBD',
  DEFAULT_LOGO: 'https://www.erithtown.com/wp-content/themes/victory/includes/images/badge-placeholder.png',
  DEFAULT_PLACEHOLDER: 'https://www.littlethings.info/wp-content/uploads/2014/04/dummy-image-green-e1398449160839.jpg',
  DEFAULT_IMAGE_URL: 'https://www.littlethings.info/wp-content/uploads/2014/04/dummy-image-green-e1398449160839.jpg'
}

export const DUMMY_FIXTURE_TABLE_COLUMNS = {
  MATCH_ID: 'id',
  HOME: 'home',
  AWAY: 'away',
  DATE: 'date',
  LOCATION: 'location',
  GROUND: 'ground',
}
export const DUMMY_FIXTURE_TABLE_DISPLAY_COLUMNS = {
  MATCH_ID: 'Unique Match ID',
  HOME: 'Home Team',
  AWAY: 'Away Team',
  DATE: 'Date & Time',
  LOCATION: 'Location',
  GROUND: 'Ground',
}

export const DELETE_SEASON_SUBHEADING = `Deletion request will disable all <strong>update match data</strong> button for you. Please provide us the reason
below: [max characters: 1000]`;
export const REVOKE_MATCH_UPDATE_SUBHEADING = `Please note that reverting the match update will revert all the numbers shown in match summaries. please provide us the reason below: [max characters: 1000]`;
export const UNIQUE_DELETION_REQUEST_CODE = 'FK-SEASON'
