import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SnackbarService } from '@app/services/snackbar.service';
import { IMatchRequest } from '@shared/interfaces/match.model';

@Component({
  selector: 'app-match-requests-panel',
  templateUrl: './match-requests-panel.component.html',
  styleUrls: ['./match-requests-panel.component.scss']
})
export class MatchRequestsPanelComponent implements OnInit {

  readonly tableColumns = {
    name: 'name',
    contactNo: 'contactNo',
    location: 'location',
    matches: 'matches',
    budget: `budget`
  };
  readonly tableUIColumns = {
    name: 'Name',
    contactNo: 'Phone',
    location: 'Location',
    matches: 'Matches Requested',
    budget: `Player's Budget`
  };
  readonly displayedCols = ['name', 'contactNo', 'location', 'matches', 'budget'];

  dataSource = new MatTableDataSource<any>([]);
  isLoaderShown = false;
  tableLength = 0;

  constructor(
    private ngFire: AngularFirestore,
    private snackbarService: SnackbarService,
  ) { }

  ngOnInit(): void {
    this.getRequests();
  }

  getRequests() {
    this.isLoaderShown = true;
    this.ngFire.collection('matchRequests').get().subscribe({
      next: (response) => {
        const list: IMatchRequest[] = [];
        if (response) {
          response.docs.forEach(element => {
            const data = element.data() as IMatchRequest;
            const id = element.id;
            list.push({ id, ...data });
          });
        }
        this.setDataSource(list);
        this.isLoaderShown = false;
      },
      error: () => {
        this.isLoaderShown = false;
        this.snackbarService.displayError();
      }
    });
  }

  setDataSource(data: IMatchRequest[]) {
    this.dataSource = new MatTableDataSource<any>(data);
    this.tableLength = data.length;
  }
}
