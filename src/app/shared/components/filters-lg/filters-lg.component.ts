import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-filters-lg',
  templateUrl: './filters-lg.component.html',
  styleUrls: ['./filters-lg.component.css'],
})
export class FiltersLgComponent implements OnInit {
  @Input('filterArray') filters: string[] = [];
  @Input('showCalendar') calendar: boolean = false;
  @Input('margin') addSpacing: boolean = true;
  constructor() {}
  ngOnInit(): void {}
  onResetFilter() {}
}
