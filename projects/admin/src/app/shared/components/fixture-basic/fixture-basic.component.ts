import { Component, Input, OnInit, } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';

@Component({
  selector: 'app-fixture-basic',
  templateUrl: './fixture-basic.component.html',
  styleUrls: ['./fixture-basic.component.css'],
})
export class FixtureBasicComponent implements OnInit {
  @Input() fixture: MatchFixture;
  adminSub: Subscription;
  todaysDate = new Date();
  constructor() { }
  ngOnInit(): void { }
}
