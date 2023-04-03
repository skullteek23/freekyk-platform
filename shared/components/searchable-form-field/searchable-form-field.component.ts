import { AfterViewInit, Component, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-searchable-form-field',
  templateUrl: './searchable-form-field.component.html',
  styleUrls: ['./searchable-form-field.component.scss']
})
export class SearchableFormFieldComponent implements OnInit, AfterViewInit {

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
    this.openSelector();
  }
  @Input() label = 'Label';
  @Output() selectionChange = new Subject<string>();
  @ViewChild(MatSelect) select: MatSelect;

  listOptions: string[] = []
  listOptionsCache: string[] = [];
  searchControl = new FormControl();

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.openSelector();
  }

  openSelector() {
    if (this.listOptionsCache?.length && this.select) {
      this.select.open();
    }
  }

  filterList() {
    const search = this.searchControl.value ? this.searchControl.value.trim().toLowerCase() : '';
    this.listOptions = this.listOptionsCache.filter(option => option?.toLowerCase()?.indexOf(search) > -1);
  }

  onSelect(value: string) {
    this.selectionChange.next(value);
  }

}
