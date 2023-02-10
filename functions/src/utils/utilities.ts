import { MatchFixture } from '@shared/interfaces/match.model';

export function sortObjectByKey(key: string, order = 'asc', isConvertNA = true): any {
  return function innerSort(a: any, b: any) {
    const isTypescriptProperty = key in a || key in b;
    if (isTypescriptProperty || a.hasOwnProperty(key) || b.hasOwnProperty(key)) {
      if (Array.isArray(a[key])) {
        const valueA = a[key].join(", ").toUpperCase();
        const valueB = b[key].join(", ").toUpperCase();
        return getSortedElement(valueA, valueB, order);
      } else {
        let valueA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
        let valueB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];
        if (isConvertNA) {
          valueA = !valueA || valueA === 'N/A' ? null : valueA;
          valueB = !valueB || valueB === 'N/A' ? null : valueB;
        } else {
          valueA = !valueA ? null : valueA;
          valueB = !valueB ? null : valueB;
        }
        return getSortedElement(valueA, valueB, order);
      }
    }
    // property doesn't exist on either object
    return 0;
  }
}

export function getSortedElement(valueA: any, valueB: any, order: string) {
  let comparison = 0;
  if (valueB === null) {
    comparison = 1;
  } else if (valueA === null) {
    comparison = -1;
  } else if (valueA > valueB) {
    comparison = 1;
  } else if (valueA < valueB) {
    comparison = -1;
  }
  return order === 'desc' ? comparison * -1 : comparison;
}

export function isFixtureAvailableHomeAndAway(fixture: MatchFixture): boolean {
  return isFixtureAvailableHome(fixture) && isFixtureAvailableAway(fixture);
}

export function isFixtureAvailableHomeOrAway(fixture: MatchFixture): boolean {
  return isFixtureAvailableHome(fixture) || isFixtureAvailableAway(fixture);
}

export function isFixtureAvailableHome(fixture: MatchFixture): boolean {
  return fixture?.home?.name === TO_BE_DECIDED;
}

export function getRandomString(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export function isFixtureAvailableAway(fixture: MatchFixture): boolean {
  return fixture?.away?.name === TO_BE_DECIDED;
}

export const TO_BE_DECIDED = 'TBD';
export const FKC_ROUND_MULTIPLIER = 2;
export const UNIQUE_ORGANIZER_CODE = 'FKYK2023';
export const ONE_DAY_IN_MILLIS = 86400000;
export const ONE_HOUR_IN_MILLIS = 3600000;
export const THREE_DAY_IN_MILLIS = 259200000;
export const ONE_WEEK_IN_MILLIS = 604800000;
export const DEFAULT_LOGO = 'https://www.erithtown.com/wp-content/themes/victory/includes/images/badge-placeholder.png';
export const DEFAULT_PLACEHOLDER = 'https://www.littlethings.info/wp-content/uploads/2014/04/dummy-image-green-e1398449160839.jpg';
export const DEFAULT_IMAGE_URL = 'https://www.littlethings.info/wp-content/uploads/2014/04/dummy-image-green-e1398449160839.jpg'
export const PLACEHOLDER_TEAM_LOGO = 'https://firebasestorage.googleapis.com/v0/b/freekyk-prod.appspot.com/o/team-media%2Fplaceholder_logo_team.jpg?alt=media&token=8e5566f0-2f03-40a0-988b-a3dea1d631ff';
export const PLACEHOLDER_TEAM_PHOTO = 'https://firebasestorage.googleapis.com/v0/b/freekyk-prod.appspot.com/o/team-media%2Fplaceholder_team.jpg?alt=media&token=fd4acbb9-2187-401b-a723-9411e4dbdd27';
