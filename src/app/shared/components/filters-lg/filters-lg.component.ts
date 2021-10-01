import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { FilterData } from '../../interfaces/others.model';

@Component({
  selector: 'app-filters-lg',
  templateUrl: './filters-lg.component.html',
  styleUrls: ['./filters-lg.component.css'],
})
export class FiltersLgComponent implements OnInit {
  // tslint:disable: no-input-rename
  @Input('filterArray') filters: string[] = [];
  @Input('showCalendar') calendar = false;
  @Input('margin') addSpacing = true;

  @Input('data') filterData: FilterData = {
    defaultFilterPath: '',
    filtersObj: {},
  };
  @Output() changeFilter = new EventEmitter();
  defaultQuery = '';

  constructor() {}
  ngOnInit(): void {}
  onResetFilter(): void {
    this.changeFilter.emit(null);
  }
  onQueryDefault(queryItem: string, queryValue: string | boolean): void {
    this.changeFilter.emit({ queryItem, queryValue });
  }
}
