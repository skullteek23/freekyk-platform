import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { TeamMemberListFilter } from 'src/app/shared/Constants/FILTERS';
import { PlayerCardComponent } from 'src/app/shared/dialogs/player-card/player-card.component';
import { FilterData, QueryInfo } from 'src/app/shared/interfaces/others.model';
import { Tmember } from 'src/app/shared/interfaces/team.model';
import { PlayerBasicInfo } from 'src/app/shared/interfaces/user.model';

@Component({
  selector: 'app-te-members',
  templateUrl: './te-members.component.html',
  styleUrls: ['./te-members.component.css'],
})
export class TeMembersComponent implements OnInit, OnDestroy {
  @Input() members: Tmember[] = [];
  subscriptions = new Subscription();
  filterData: FilterData;
  term: string = null;
  constructor(private dialog: MatDialog, private ngFire: AngularFirestore) {}
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
    this.subscriptions.add(
      this.ngFire
        .collection('players')
        .doc(pid)
        .get()
        .pipe(
          map((resp) => ({
              id: pid,
              ...(resp.data() as PlayerBasicInfo),
            } as PlayerBasicInfo))
        )
        .subscribe((response) => {
          const dialogRef = this.dialog.open(PlayerCardComponent, {
            panelClass: 'fk-dialogs',
            data: response,
          });
        })
    );
  }
  onChangeFilter(queryInfo: QueryInfo): void {
    if (queryInfo) {
      this.term = queryInfo.queryValue;
    } else {
      this.term = null;
    }
  }
}
