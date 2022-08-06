export class MatchConstants {
  public static GROUND_HOURS: number[] = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
  public static DAYS_LIST: string[] = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
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
  public static DEFAULT_LOGO: 'https://firebasestorage.googleapis.com/v0/b/freekyk-prod.appspot.com/o/dummy_logo.png?alt=media&token=c787be11-7ed7-4df4-95d0-5ed0dffd3102'
  public static SEASON_PRICE = {
    MIN: 500,
    MAX: 20000,
  }
  public static START_DATE_DIFF = {
    MIN: 1,
    MAX: 365,
  }
}
export const MatchConstantsSecondary = {
  TO_BE_DECIDED: 'TBD',
  DEFAULT_LOGO: 'https://firebasestorage.googleapis.com/v0/b/freekyk-prod.appspot.com/o/dummy_logo.png?alt=media&token=c787be11-7ed7-4df4-95d0-5ed0dffd3102',
  DEFAULT_PLACEHOLDER: 'assets/placeholder_product.png',
  DEFAULT_IMAGE_URL: 'https://firebasestorage.googleapis.com/v0/b/freekyk-prod.appspot.com/o/dummy_logo.png?alt=media&token=c787be11-7ed7-4df4-95d0-5ed0dffd3102'
}

export const DUMMY_FIXTURE_TABLE_COLUMNS = {
  MATCH_ID: 'mid',
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
