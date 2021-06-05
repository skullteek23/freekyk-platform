import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TeamCommunicationService } from 'src/app/services/team-communication.service';
import { AskPlayerSelectorComponent } from '../ask-player-selector/ask-player-selector.component';

@Component({
  selector: 'app-upcoming-match-tab',
  templateUrl: './upcoming-match-tab.component.html',
  styleUrls: ['./upcoming-match-tab.component.css'],
})
export class UpcomingMatchTabComponent implements OnInit {
  // @Input('upcMatchNumber') matchNumb: number;
  @Input('captain') isCaptain: boolean;
  memberNames$: Observable<{ id: string; name: string }[]>;
  disableButton: boolean;
  disableCheck: boolean;
  constructor(
    private dialog: MatDialog,
    private commServ: TeamCommunicationService
  ) {}

  ngOnInit(): void {
    // this.memberNames$ = this.store.select('team').pipe(
    //   map(
    //     (resp) => <{ id: string; name: string }[]>(<Tmember[]>(
    //         resp.teamMembers.members
    //       )).map((m) => ({
    //         name: m.name,
    //         id: m.id,
    //       }))
    //   )
    // );
  }
  onOpenAskPlayersDialog() {
    // this.disableCheck = true;
    // console.log(this.matchNumb);
    this.dialog.open(AskPlayerSelectorComponent, {
      panelClass: 'large-dialogs',
    });
  }

  onRespond(resp: boolean) {
    this.disableButton = true;
    this.commServ.updateResponseByMember(resp);
  }
}
