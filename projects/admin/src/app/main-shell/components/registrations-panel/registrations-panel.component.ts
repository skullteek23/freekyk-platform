import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { SnackbarService } from '@app/services/snackbar.service';
import { ConfirmationBoxComponent } from '@shared/dialogs/confirmation-box/confirmation-box.component';
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
    private snackbarService: SnackbarService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getRequests();
  }

  getRequests() {
    this.isLoaderShown = true;
    this.ngFire.collection('admins').get().subscribe({
      next: (response) => {
        const data: Admin[] = [];
        if (response) {
          response.docs.forEach(element => {
            const adminData = element.data() as Admin;
            const id = element.id;
            if (adminData.role !== AssignedRoles.superAdmin) {
              data.push({ id, ...adminData });
            }
          });
        }
        this.setDataSource(data);
        this.isLoaderShown = false;
      },
      error: () => {
        this.isLoaderShown = false;
        this.snackbarService.displayError();
      }
    });
  }

  onDelete(element: Admin) {
    this.dialog.open(ConfirmationBoxComponent)
      .afterClosed()
      .subscribe({
        next: (response) => {
          if (response) {
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
        }
      })
  }

  setDataSource(data: Admin[]) {
    this.dataSource = new MatTableDataSource<any>(data);
  }

  onChangeStatus(element: any, selection: MatSelectChange) {
    this.dialog.open(ConfirmationBoxComponent)
      .afterClosed()
      .subscribe({
        next: (response) => {
          if (response) {
            this.isLoaderShown = true;
            this.ngFire.collection('admins').doc(element.id).update({ status: selection.value })
              .then(() => {
                this.snackbarService.displayCustomMsg('Request status changed successfully!');
                this.getRequests();
              })
              .catch(err => {
                this.snackbarService.displayError('Update operation failed');
                this.getRequests();
              });
          } else {
            this.getRequests();
          }
        }
      })
  }

}
