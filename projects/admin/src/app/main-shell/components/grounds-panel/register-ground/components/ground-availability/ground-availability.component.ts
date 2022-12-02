import { Component, OnInit } from '@angular/core';
import { DAYS, MatchConstants } from '@shared/constants/constants';
import { IGroundAvailability } from '@shared/interfaces/ground.model';
import { ITiming } from '@shared/interfaces/others.model';

@Component({
  selector: 'app-ground-availability',
  templateUrl: './ground-availability.component.html',
  styleUrls: ['./ground-availability.component.scss']
})
export class GroundAvailabilityComponent implements OnInit {
  allowedHours: number[] = MatchConstants.GROUND_HOURS;
  days = [
    DAYS[0], DAYS[1], DAYS[2], DAYS[3], DAYS[4], DAYS[5], DAYS[6]
  ];
  timingArray: ITiming[] = [];


  constructor() { }

  ngOnInit(): void {
    this.createTimingArray();
    this.getLastSavedData();
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

  getLastSavedData() {
    const groundAvailability: IGroundAvailability = JSON.parse(sessionStorage.getItem('groundAvailability'));
    if (groundAvailability && groundAvailability.length) {
      this.timingArray.forEach(element => {
        if (groundAvailability.findIndex(el => el.day === element.day && el.hour === element.hour) > -1) {
          element.selected = true;
        }
      });
    }
  }
}
