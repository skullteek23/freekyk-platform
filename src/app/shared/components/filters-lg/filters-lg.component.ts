import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SnackbarService } from 'src/app/services/snackbar.service';

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

  @Input('data') filterData: FilterData;
  @Output() changeFilter = new EventEmitter();
  defaultQuery = '';

  constructor(private snackServ: SnackbarService) {}
  ngOnInit(): void {}
  onResetFilter(): void {
    this.changeFilter.emit(null);
  }
  onQueryDefault(queryItem: string, queryValue: string | boolean): void {
    this.snackServ.displayApplied();
    this.changeFilter.emit({ queryItem, queryValue });
  }
}
