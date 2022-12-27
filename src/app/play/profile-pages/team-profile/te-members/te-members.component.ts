import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { TeamMemberListFilter } from '@shared/Constants/FILTERS';
import { PlayerCardComponent } from '@shared/dialogs/player-card/player-card.component';
import { FilterData, QueryInfo } from '@shared/interfaces/others.model';
import { Tmember } from '@shared/interfaces/team.model';
import { PlayerBasicInfo } from '@shared/interfaces/user.model';

@Component({
  selector: 'app-te-members',
  templateUrl: './te-members.component.html',
  styleUrls: ['./te-members.component.scss'],
})
export class TeMembersComponent implements OnInit, OnDestroy {

  @Input() members: Tmember[] = [];

  subscriptions = new Subscription();
  filterData: FilterData;
  term: string = null;

  constructor(
    private dialog: MatDialog,
    private ngFire: AngularFirestore
  ) { }

  ngOnInit(): void {
    this.filterData = {
      defaultFilterPath: '',
      filtersObj: TeamMemberListFilter,
    };
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  onOpenPlayerProfile(pid: string): void {
    const dialogRef = this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: pid,
    });
  }

  onChangeFilter(queryInfo: QueryInfo): void {
    if (queryInfo) {
      this.term = queryInfo.queryValue;
    } else {
      this.term = null;
    }
  }
}
