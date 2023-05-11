import { Component, Input, OnInit } from '@angular/core';
import { ISeason } from '@shared/interfaces/season.model';

@Component({
  selector: 'app-season-strip',
  templateUrl: './season-strip.component.html',
  styleUrls: ['./season-strip.component.scss']
})
export class SeasonStripComponent implements OnInit {

  @Input() data: ISeason = null;

  constructor() { }

  ngOnInit(): void {
  }

}
