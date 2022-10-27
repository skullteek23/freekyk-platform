import { LeagueTableModel } from "../interfaces/others.model";

export class ArraySorting {

  static sortObjectByKey(key: string, order = 'asc', isConvertNA = true) {
    return function innerSort(a, b) {
      const isTypescriptProperty = key in a || key in b;
      if (isTypescriptProperty || a.hasOwnProperty(key) || b.hasOwnProperty(key)) {
        if (Array.isArray(a[key])) {
          const valueA = a[key].join(", ").toUpperCase();
          const valueB = b[key].join(", ").toUpperCase();
          return ArraySorting.getSortedElement(valueA, valueB, order);
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
          return ArraySorting.getSortedElement(valueA, valueB, order);
        }
      }
      // property doesn't exist on either object
      return 0;
    }
  }

  static getSortedElement(valueA: any, valueB: any, order: string): number {
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

  static getSortedLeague(valueA: LeagueTableModel, valueB: LeagueTableModel, order = 'asc') {
    let comparison = 0;
    // If any team finish with the same number of points, their position in the League table is determined by goal difference (GD), then the number of goals scored (GF)
    if (valueA.pts > valueB.pts) {
      comparison = 1;
    } else if (valueA.pts < valueB.pts) {
      comparison = -1;
    } else if (valueA.gd > valueB.gd) {
      comparison = 1;
    } else if (valueA.gd < valueB.gd) {
      comparison = -1;
    } else if (valueA.gf > valueB.gf) {
      comparison = 1;
    } else if (valueA.gf < valueB.gf) {
      comparison = -1;
    }
    return order === 'desc' ? comparison * -1 : comparison;
  }
}
