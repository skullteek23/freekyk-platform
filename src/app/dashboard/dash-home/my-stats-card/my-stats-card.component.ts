import { Component, Input, OnInit } from '@angular/core';

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
  @Input() label = 'My Stats';

  @Input() data: IStatisticsCard[];

  constructor() { }

  ngOnInit(): void {
  }

}
