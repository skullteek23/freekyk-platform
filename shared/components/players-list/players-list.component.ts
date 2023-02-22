import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { PlayerCardComponent } from '@shared/dialogs/player-card/player-card.component';
import { PlayerBasicInfo } from '@shared/interfaces/user.model';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-players-list',
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.scss']
})
export class PlayersListComponent implements OnInit {

  @Input() set players(value: PlayerBasicInfo[]) {
    if (value) {
      this.setDataSource(value);
    }
  }
  @Input() cols = ['jersey', 'player', 'Team', 'Location', 'PlayingPos'];
  @Input() showSearch = true;
  @Input() maxLimit = 1;
  @Output() selectionChange = new Subject<PlayerBasicInfo[]>();

  filterTerm: string = null;
  selectedRowIndex;
  onMobile = false;
  isInvalidSelection = false;
  subscriptions = new Subscription();
  selection = new SelectionModel<PlayerBasicInfo>(true, []);
  dataSource = new MatTableDataSource<PlayerBasicInfo>([]);

  constructor(
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  selectRow(row: PlayerBasicInfo) {
    this.selection.toggle(row);
    if (this.selection.selected.length > this.maxLimit) {
      this.isInvalidSelection = true;
      this.selectionChange.next([]);
    } else {
      this.isInvalidSelection = false;
      this.selectionChange.next(this.selection.selected);
    }
  }

  openProfile(player: PlayerBasicInfo) {
    this.openPlayerCard(player.id);
  }

  openPlayerCard(playerID: string) {
    this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: playerID,
    });
  }

  setDataSource(list: PlayerBasicInfo[]) {
    this.dataSource = new MatTableDataSource(list);
    this.dataSource.filterPredicate = (data, searchValue) => {
      return data?.name?.toLowerCase()?.includes(searchValue);
    }
  }

  applyFilter(searchValue: string) {
    if (searchValue || searchValue === '') {
      this.dataSource.filter = searchValue.trim().toLowerCase();
    }

  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected == numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

}
