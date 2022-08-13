export class ArraySorting {

  static sortObjectByKey(key: string, order = 'asc', isConvertNA = true): any {
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

  static getSortedElement(valueA: any, valueB: any, order: string) {
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
}
