import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TeamCommunicationService } from 'src/app/services/team-communication.service';
import { AskPlayerSelectorComponent } from '../ask-player-selector/ask-player-selector.component';

@Component({
  selector: 'app-upcoming-match-tab',
  templateUrl: './upcoming-match-tab.component.html',
  styleUrls: ['./upcoming-match-tab.component.scss'],
})
export class UpcomingMatchTabComponent implements OnInit {
  @Input() captain: boolean;
  memberNames$: Observable<{ id: string; name: string }[]>;
  disableButton: boolean;
  disableCheck: boolean;
  constructor(
    private dialog: MatDialog,
    private commServ: TeamCommunicationService
  ) {}
  ngOnInit(): void {}
  onOpenAskPlayersDialog(): void {
    this.dialog.open(AskPlayerSelectorComponent, {
      panelClass: 'large-dialogs',
    });
  }

  onRespond(resp: boolean): void {
    this.disableButton = true;
    this.commServ.updateResponseByMember(resp);
  }
}
