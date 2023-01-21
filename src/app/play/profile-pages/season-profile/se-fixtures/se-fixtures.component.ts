import { Component, Input, OnInit } from '@angular/core';
import { MatchFixture } from '@shared/interfaces/match.model';
import { ArraySorting } from '@shared/utils/array-sorting';

@Component({
  selector: 'app-se-fixtures',
  templateUrl: './se-fixtures.component.html',
  styleUrls: ['./se-fixtures.component.scss']
})
export class SeFixturesComponent implements OnInit {

  @Input() set list(value: MatchFixture[]) {
    if (value?.length) {
      this.matches = value.sort(ArraySorting.sortObjectByKey('date'));
    } else {
      this.matches = [];
    }
  }

  matches: MatchFixture[] = [];

  constructor() { }

  ngOnInit(): void { }


}
