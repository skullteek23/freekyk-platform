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

export function isFixtureAvailableAway(fixture: MatchFixture): boolean {
  return fixture?.away?.name === TO_BE_DECIDED;
}

export const Constants = {
}
export const TO_BE_DECIDED = 'TBD';
export const FKC_ROUND_MULTIPLIER = 2;
export const UNIQUE_ORGANIZER_CODE = 'FKYK2022';
export const DEFAULT_LOGO = 'https://www.erithtown.com/wp-content/themes/victory/includes/images/badge-placeholder.png';
export const DEFAULT_PLACEHOLDER = 'https://www.littlethings.info/wp-content/uploads/2014/04/dummy-image-green-e1398449160839.jpg';
export const DEFAULT_IMAGE_URL = 'https://www.littlethings.info/wp-content/uploads/2014/04/dummy-image-green-e1398449160839.jpg'
