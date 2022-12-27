import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { FilterData } from '../../interfaces/others.model';

@Component({
  selector: 'app-filters-lg',
  templateUrl: './filters-lg.component.html',
  styleUrls: ['./filters-lg.component.scss'],
})
export class FiltersLgComponent implements OnInit {
  @Input('filterArray') filters: string[] = [];
  @Input('margin') addSpacing = true;

  @Input('data') filterData: FilterData = {
    defaultFilterPath: '',
    filtersObj: {},
  };
  @Output() changeFilter = new EventEmitter();

  defaultQuery = '';

  constructor(
    private snackBarService: SnackbarService
  ) { }

  ngOnInit(): void { }

  onResetFilter(): void {
    this.changeFilter.emit(null);
  }

  onQueryDefault(queryItem: string, queryValue: string | boolean): void {
    this.snackBarService.displayCustomMsg('Filter Applied!');
    this.changeFilter.emit({ queryItem, queryValue });
  }
}
