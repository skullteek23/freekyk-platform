import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilterDialogComponent } from '../../dialogs/filter-dialog/filter-dialog.component';

@Component({
  selector: 'app-filters-sm',
  templateUrl: './filters-sm.component.html',
  styleUrls: ['./filters-sm.component.css'],
})
export class FiltersSmComponent implements OnInit {
  @Input('filterArray') filters: string[] = [];
  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {}
  onOpenFilter() {
    const dialogRef = this.dialog.open(FilterDialogComponent, {
      panelClass: 'fk-dialogs',
      data: this.filters,
    });
  }
}
