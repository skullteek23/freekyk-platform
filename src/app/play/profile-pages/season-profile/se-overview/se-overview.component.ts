import { Component, Input, OnInit } from '@angular/core';
import {
  SeasonAbout,
  SeasonParticipants,
} from 'src/app/shared/interfaces/season.model';

@Component({
  selector: 'app-se-overview',
  templateUrl: './se-overview.component.html',
  styleUrls: ['./se-overview.component.css'],
})
export class SeOverviewComponent implements OnInit {
  @Input() data: SeasonAbout;
  @Input() participants: SeasonParticipants[] = [];
  @Input() venue: { city: string; state: string };
  constructor() {}
  ngOnInit(): void {}
}
