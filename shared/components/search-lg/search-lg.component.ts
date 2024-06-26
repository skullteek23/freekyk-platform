import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, } from 'rxjs/operators';

@Component({
  selector: 'app-search-lg',
  templateUrl: './search-lg.component.html',
  styleUrls: ['./search-lg.component.scss'],
})
export class SearchLgComponent implements OnInit {

  @Output() searchItem = new EventEmitter<string>();
  @ViewChild('searchInput', { static: true }) searchInputEvent: ElementRef;
  @Input('searchPlaceholder') placeholder = 'Search any item...';
  @Input() isDisabled = false;

  constructor() { }

  ngOnInit(): void {
    fromEvent(this.searchInputEvent.nativeElement, 'keyup')
      .pipe(
        // get value
        map((event: any) => event.target.value.toLowerCase()),
        // if character length greater then 2
        filter((res) => res.length > 2 || res === ''),

        // Time in milliseconds between key events
        debounceTime(100),

        // If previous query is diffent from current
        distinctUntilChanged(),

        // tap((resp) => console.log(resp))
        // subscription for response
      )
      .subscribe((searchValue: string) => this.searchItem.emit(searchValue));
  }
}
