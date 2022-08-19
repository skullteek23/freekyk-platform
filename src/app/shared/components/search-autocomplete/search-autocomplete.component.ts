import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
export interface ListOption { viewValue: string, data: any };
@Component({
  selector: 'app-search-autocomplete',
  templateUrl: './search-autocomplete.component.html',
  styleUrls: ['./search-autocomplete.component.css']
})
export class SearchAutocompleteComponent implements OnInit {
  @Input() placeholder = '';
  @Input() isDisabled = false;
  @Input() set options(value: ListOption[]) {
    this.optionsList = value;
    this.optionsListCache = value;
  }
  @Output() selectionChange = new EventEmitter<ListOption>();

  @ViewChild('searchinputAutocompleteElement', { static: true }) searchInputEvent: ElementRef;
  optionsList: ListOption[] = [];
  optionsListCache: ListOption[] = [];
  searchForm: FormGroup;
  constructor() { }

  ngOnInit(): void {
    this.searchForm = new FormGroup({
      searchKey: new FormControl(null, Validators.pattern('^[a-zA-Z0-9- ]*$'))
    })
    fromEvent(this.searchInputEvent.nativeElement, 'keyup')
      .pipe(
        map((event: any) => {
          return event.target.value.toLowerCase();
        }),
      )
      .subscribe((searchValue: string) => {
        // subscription for response
        if (!searchValue) {
          this.optionsList = this.optionsListCache;
        } else {
          this.optionsList = this.optionsListCache.filter((item) => item.viewValue.trim().toLowerCase().includes(searchValue.trim()));
        }
      });
  }

  onSelectionChange(ev: MatAutocompleteSelectedEvent) {
    this.selectionChange.emit(ev.option.value);
    this.resetForm();
    // this.searchForm.markAsUntouched();
    this.searchForm.markAsPristine();
  }
  resetForm() {
    this.searchForm.get('searchKey').setValue(null);
  }

}