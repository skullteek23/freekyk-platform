import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DAYS, MatchConstants } from '@shared/constants/constants';
import { ITiming } from '@shared/interfaces/others.model';

@Component({
  selector: 'app-ground-availability',
  templateUrl: './ground-availability.component.html',
  styleUrls: ['./ground-availability.component.scss']
})
export class GroundAvailabilityComponent implements OnInit {
  availabilityForm: FormGroup;
  allowedHours: number[] = MatchConstants.GROUND_HOURS;
  days = [
    DAYS[0], DAYS[1], DAYS[2], DAYS[3], DAYS[4], DAYS[5], DAYS[6]
  ];
  timingArray: ITiming[] = [];


  constructor() { }

  ngOnInit(): void {
    this.initForm();
    this.createTimingArray();
  }

  initForm() {
    this.availabilityForm = new FormGroup({
      timingsPreferences: new FormControl(null, Validators.required)
    })
  }

  onSelectionChange(change: ITiming) {
    const index = this.timingArray.findIndex(el => el.day === change.day && el.hour === change.hour);
    if (index > -1) {
      this.timingArray[index].selected = !change.selected;
    }
  }

  createTimingArray() {
    this.allowedHours.forEach(hour => {
      this.days.forEach(day => {
        this.timingArray.push({
          hour: hour,
          day: day,
          selected: false
        })
      });
    });
  }
}
