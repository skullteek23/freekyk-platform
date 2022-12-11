import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatListOption } from '@angular/material/list';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TeamCommunicationService } from 'src/app/services/team-communication.service';
import { Tmember } from '@shared/interfaces/team.model';
import { TeamState } from '../../store/team.reducer';
import { TeamCommState } from '../store/teamComm.reducer';
import { ArraySorting } from '@shared/utils/array-sorting';

@Component({
  selector: 'app-ask-player-selector',
  templateUrl: './ask-player-selector.component.html',
  styleUrls: ['./ask-player-selector.component.scss'],
})
export class AskPlayerSelectorComponent implements OnInit, OnDestroy {
  members$: Observable<Tmember[]>;
  subscriptions = new Subscription();
  constructor(
    public dialogRef: MatDialogRef<AskPlayerSelectorComponent>,
    private store2: Store<{ team: TeamState }>,
    private store3: Store<{ teamComms: TeamCommState }>,
    private commServ: TeamCommunicationService
  ) { }
  ngOnInit(): void {
    this.members$ = this.store2.select('team').pipe(
      // tap((resp) => console.log(resp)),
      map((resp) => resp?.teamMembers.members as Tmember[]),
      map((resp) => {
        const slice = resp.filter((respDoc) => respDoc.id !== localStorage.getItem('uid'));
        return slice.sort(ArraySorting.sortObjectByKey('name'));
      }
      )
    );
    this.subscriptions.add(
      this.store3.select('teamComms').subscribe((data) => {
        // console.log(data)
      })
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  onCloseDialog(): void {
    this.dialogRef.close();
  }
  onConfirmPlayers(selections: MatListOption[]): void {
    this.commServ
      .createActiveSquadByCaptain(selections.map((sel) => sel.value))
      .unsubscribe();
    this.onCloseDialog();
  }
}
