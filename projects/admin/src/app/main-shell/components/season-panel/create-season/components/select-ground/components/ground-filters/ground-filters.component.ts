import { Component, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GROUNDS_FEATURES_LIST, MatchConstants } from '@shared/constants/constants';
import { IFilter } from '@shared/interfaces/others.model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-ground-filters',
  templateUrl: './ground-filters.component.html',
  styleUrls: ['./ground-filters.component.scss']
})
export class GroundFiltersComponent implements OnInit {

  @Input() set data(value: string[]) {
    this.cities = value || [];
    this.initForm();
    this.addListenerToForm();
  }
  @Input() set selectedCityName(value: string) {
    if (value) {
      this.selectedCity = value;
    } else if (this.cities) {
      this.selectedCity = value && value.length ? value[0] : null;
    } else {
      this.selectedCity = null;
    }
  }
  @Output() filterChange = new Subject<Partial<IFilter>>();

  readonly featuresList = GROUNDS_FEATURES_LIST;

  cities: string[] = [];
  selectedCity: string;
  filterForm: FormGroup;

  constructor() { }

  ngOnInit(): void { }

  initForm() {
    this.filterForm = new FormGroup({
      city: new FormControl(this.selectedCity, [Validators.required]),
      referee: new FormControl(null, [Validators.required]),
      foodBev: new FormControl(null, [Validators.required]),
      parking: new FormControl(null, [Validators.required]),
      goalpost: new FormControl(null, [Validators.required]),
      washroom: new FormControl(null, [Validators.required]),
      staff: new FormControl(null, [Validators.required]),
    });
  }

  addListenerToForm() {
    this.filterForm.valueChanges.subscribe(changes => {
      const validChanges: any = {};
      for (const key in changes) {
        if (Object.prototype.hasOwnProperty.call(changes, key) && changes[key] !== false && changes[key] !== null) {
          validChanges[key] = changes[key];
        }
      }
      this.filterChange.next(validChanges);
    });
  }

}
