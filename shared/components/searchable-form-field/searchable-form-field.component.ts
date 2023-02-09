import { Component, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-searchable-form-field',
  templateUrl: './searchable-form-field.component.html',
  styleUrls: ['./searchable-form-field.component.scss']
})
export class SearchableFormFieldComponent implements OnInit {

  @Input() control = new FormControl();
  @Input() required = true;
  @Input() set list(value: string[]) {
    if (value && value.length) {
      this.control.enable();
      this.listOptions = value;
      this.listOptionsCache = JSON.parse(JSON.stringify(value));
    } else {
      this.control.disable();
    }
  }
  @Input() label = 'Label';
  @Output() selectionChange = new Subject<string>();

  listOptions: string[] = []
  listOptionsCache: string[] = [];
  searchControl = new FormControl();

  constructor() { }

  ngOnInit(): void {
  }

  filterList() {
    const search = this.searchControl.value ? this.searchControl.value.trim().toLowerCase() : '';
    this.listOptions = this.listOptionsCache.filter(option => option?.toLowerCase()?.indexOf(search) > -1);
  }

  onSelect(value: string) {
    this.selectionChange.next(value);
  }

}
