import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActiveSquadMember } from '@shared/interfaces/team.model';
import { TeamCommState } from '../store/teamComm.reducer';

@Component({
  selector: 'app-active-squad',
  templateUrl: './active-squad.component.html',
  styleUrls: ['./active-squad.component.css'],
})
export class ActiveSquadComponent implements OnInit {
  // @Input('data') sqNumber: number;
  sqData$: Observable<ActiveSquadMember[]>;
  constructor(private store: Store<{ teamComms: TeamCommState }>) { }
  ngOnInit(): void {
    this.sqData$ = this.store
      .select('teamComms')
      .pipe(map((resp) => resp.activeSquad as ActiveSquadMember[]));
  }
}
