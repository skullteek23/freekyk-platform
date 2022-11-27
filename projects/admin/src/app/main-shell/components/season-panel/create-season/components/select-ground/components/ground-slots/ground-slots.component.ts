import { Component, Input, OnInit } from '@angular/core';
import { IGroundInfo } from '../../select-ground.component';

@Component({
  selector: 'app-ground-slots',
  templateUrl: './ground-slots.component.html',
  styleUrls: ['./ground-slots.component.scss']
})
export class GroundSlotsComponent implements OnInit {

  @Input() groundsList: Partial<IGroundInfo>[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
