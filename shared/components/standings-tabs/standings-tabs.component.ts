import { Component, Input, OnInit } from '@angular/core';
import { LeagueTableModel } from '@shared/interfaces/others.model';
import { IKnockoutData } from '../knockout-bracket/knockout-bracket.component';

@Component({
  selector: 'app-standings-tabs',
  templateUrl: './standings-tabs.component.html',
  styleUrls: ['./standings-tabs.component.scss']
})
export class StandingsTabsComponent implements OnInit {

  @Input() knockoutData: IKnockoutData;
  @Input() leagueData: LeagueTableModel[] = [];

  constructor() { }

  ngOnInit(): void {
  }
}
