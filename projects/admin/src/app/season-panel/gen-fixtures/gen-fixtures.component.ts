import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { Subscription } from 'rxjs';
import { SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';
import { GenFixtService } from './gen-fixt.service';

@Component({
  selector: 'app-gen-fixtures',
  templateUrl: './gen-fixtures.component.html',
  styleUrls: ['./gen-fixtures.component.css'],
  providers: [GenFixtService],
})
export class GenFixturesComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') Stepper: MatStepper;
  sub: Subscription;
  data: { pCount: number; stDate: Date; tmt: 'FKC' | 'FCP' | 'FPL' };
  constructor(private genServ: GenFixtService) {
    this.sub = genServ.stepChange.subscribe((response) => {
      response ? this.Stepper.next() : this.Stepper.previous();
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  ngOnInit(): void {}
}
