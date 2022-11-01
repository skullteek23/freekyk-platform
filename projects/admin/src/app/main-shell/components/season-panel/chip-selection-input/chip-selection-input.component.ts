import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, ElementRef, Input, Output, ViewChild } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Subject } from 'rxjs';
import { ListOption } from '@shared/interfaces/others.model';

@Component({
  selector: 'app-chip-selection-input',
  templateUrl: './chip-selection-input.component.html',
  styleUrls: ['./chip-selection-input.component.css']
})
export class ChipSelectionInputComponent {

  @Input() label = '';
  @Input() autoCompleteList: ListOption[] = [];
  @Input() chipClass = '';
  @Input() max = 0;
  @Output() addOption = new Subject<ListOption>();
  @Output() remove = new Subject<number>();

  @ViewChild('scorerInput') scorerInput: ElementRef<HTMLInputElement>;

  list: ListOption[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];

  add(ev: MatAutocompleteSelectedEvent) {
    if (this.isMax) {
      return;
    }
    if (this.list.findIndex(value => value.value === ev.option.value.value) === -1) {
      this.list.push(ev.option.value);
    }
    this.addOption.next(ev.option.value);
    this.scorerInput.nativeElement.value = '';
  }

  removeFromLast() {
    if (this.list.length) {
      const removeIndex = this.list.length - 1;
      this.list.splice(removeIndex, 1);
    }
  }

  get isMax(): boolean {
    return this.max && (this.max === this.list.length);
  }

}
