import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { TeamMemberListFilter } from '@shared/Constants/FILTERS';
import { PlayerCardComponent } from '@shared/dialogs/player-card/player-card.component';
import { FilterData, QueryInfo } from '@shared/interfaces/others.model';
import { Tmember } from '@shared/interfaces/team.model';
import { PlayerBasicInfo } from '@shared/interfaces/user.model';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css'],
})
export class MemberListComponent implements OnInit {
  @Input() margin = false;
  @Input() membersArray: Tmember[] = [];
  @Input() capId: string;
  filterData: FilterData;
  term: string = null;
  constructor(private dialog: MatDialog, private ngFire: AngularFirestore) { }
  ngOnInit(): void {
    this.filterData = {
      defaultFilterPath: '',
      filtersObj: TeamMemberListFilter,
    };
  }
  async onOpenPlayerProfile(pid: string): Promise<any> {
    const playersnap = await this.ngFire
      .collection('players')
      .doc(pid)
      .get()
      .pipe(
        map((resp) => ({
          id: pid,
          ...(resp.data() as PlayerBasicInfo),
        } as PlayerBasicInfo))
      )
      .toPromise();
    const dialogRef = this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: playersnap,
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
