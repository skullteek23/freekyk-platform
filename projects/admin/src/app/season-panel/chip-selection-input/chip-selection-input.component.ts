import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, ElementRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Subject } from 'rxjs';
import { ListOption } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-chip-selection-input',
  templateUrl: './chip-selection-input.component.html',
  styleUrls: ['./chip-selection-input.component.css']
})
export class ChipSelectionInputComponent implements OnInit {

  list: ListOption[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];

  @Input() label = '';
  @Input() autoCompleteList: ListOption[] = [];
  @Input() chipClass = '';
  @Input() max = 0;
  @Output() onAddItem = new Subject<ListOption[]>();

  @ViewChild('scorerInput') scorerInput: ElementRef<HTMLInputElement>;

  constructor() { }

  ngOnInit(): void {
  }

  add(ev: MatAutocompleteSelectedEvent) {
    if (this.isMax) {
      return;
    }
    if (this.list.findIndex(value => value.value === ev.option.value.value) === -1) {
      this.list.push(ev.option.value);
    }
    this.onAddItem.next(this.list);
    this.scorerInput.nativeElement.value = '';
  }

  remove(item: ListOption) {
    const index = this.list.findIndex(value => value.value === item.value);

    if (index >= 0) {
      this.list.splice(index, 1);
    }
    this.onAddItem.next(this.list);
  }

  get isMax(): boolean {
    return this.max === this.list.length;
  }

}
