import { Component, Input, OnInit, Output } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ListOption } from '@shared/interfaces/others.model';
import { TeamBasicInfo } from '@shared/interfaces/team.model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-team-selection-list',
  templateUrl: './team-selection-list.component.html',
  styleUrls: ['./team-selection-list.component.scss']
})
export class TeamSelectionListComponent implements OnInit {

  @Input() teamList: TeamBasicInfo[] = [];
  @Output() selectionChange = new Subject<TeamBasicInfo>();

  constructor() { }

  ngOnInit(): void {
  }
  onSelectTeam(value: TeamBasicInfo) {
    this.selectionChange.next(value);
  }

}
