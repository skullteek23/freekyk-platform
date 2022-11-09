import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatTableDataSource } from '@angular/material/table';
import { SnackbarService } from '@app/services/snackbar.service';
import { RegistrationRequest } from '@shared/interfaces/admin.model';

@Component({
  selector: 'app-registrations-panel',
  templateUrl: './registrations-panel.component.html',
  styleUrls: ['./registrations-panel.component.scss']
})
export class RegistrationsPanelComponent implements OnInit {

  readonly tableColumns = {
    id: 'id',
    company: 'company',
    name: 'name',
    phone: 'phone',
    location: 'location',
    status: 'status',
  };

  readonly tableUIColumns = {
    id: 'Organizer ID',
    company: 'Company',
    name: 'Name',
    phone: 'Phone',
    location: 'Location',
    status: 'Status',
  };

  readonly displayedCols = ['id', 'company', 'name', 'phone', 'location', 'status'];

  dataSource = new MatTableDataSource<any>([]);
  isLoaderShown = false;

  constructor(
    private ngFire: AngularFirestore,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.getRequests();
  }

  getRequests() {
    this.isLoaderShown = true;
    this.ngFire.collection('adminRegistrationRequests').get().subscribe({
      next: (response) => {
        if (response) {
          const data = response.docs.map(element => ({ id: element.id, ...element.data() as RegistrationRequest }));
          this.setDataSource(data);
        } else {
          this.setDataSource([]);
        }
        this.isLoaderShown = false;
      },
      error: () => {
        this.isLoaderShown = false;
        this.snackbarService.displayError();
      }
    });
  }

  setDataSource(data: RegistrationRequest[]) {
    this.dataSource = new MatTableDataSource<any>(data);
  }

  onTriggerAction(element) {

  }

}
