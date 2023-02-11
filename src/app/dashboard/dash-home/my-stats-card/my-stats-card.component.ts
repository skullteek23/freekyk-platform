import { Component, Input, OnInit } from '@angular/core';
import { BasicStats } from '@shared/interfaces/user.model';

export interface IStatisticsCard {
  icon: string;
  label: string;
  value: number;
  iconClass?: string
}

@Component({
  selector: 'app-my-stats-card',
  templateUrl: './my-stats-card.component.html',
  styleUrls: ['./my-stats-card.component.scss']
})
export class MyStatsCardComponent implements OnInit {

  @Input() data: IStatisticsCard[];

  constructor() { }

  ngOnInit(): void {
  }

}
