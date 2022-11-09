import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { SnackbarService } from '@app/services/snackbar.service';
import { Admin, AssignedRoles } from '@shared/interfaces/admin.model';

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

  readonly displayedCols = ['id', 'company', 'name', 'phone', 'location', 'status', 'actions'];

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
    this.ngFire.collection('admins').get().subscribe({
      next: (response) => {
        if (response) {
          const data: Admin[] = [];
          response.docs.forEach(element => {
            const adminData = element.data() as Admin;
            const id = element.id;
            if (adminData.role !== AssignedRoles.superAdmin) {
              data.push({ id, ...adminData });
            }
          });
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

  onDelete(element: Admin) {
    this.isLoaderShown = true;
    this.ngFire.collection('admins').doc(element.id).delete()
      .then(() => {
        this.snackbarService.displayCustomMsg('Request deleted successfully!');
        this.getRequests();
      })
      .catch(err => {
        this.isLoaderShown = false;
        this.snackbarService.displayError('Delete operation failed');
      });
  }

  setDataSource(data: Admin[]) {
    this.dataSource = new MatTableDataSource<any>(data);
  }

  onChangeStatus(element: any, selection: MatSelectChange) {
    this.isLoaderShown = true;
    this.ngFire.collection('admins').doc(element.id).update({ status: selection.value })
      .then(() => {
        this.snackbarService.displayCustomMsg('Request status changed successfully!');
        this.getRequests();
      })
      .catch(err => {
        this.isLoaderShown = false;
        this.snackbarService.displayError('Update operation failed');
      });
  }

}
