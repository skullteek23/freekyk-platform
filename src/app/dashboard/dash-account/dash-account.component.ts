import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@app/services/auth.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { UpdateInfoComponent } from '@shared/components/update-info/update-info.component';
import { DeactivateProfileRequestComponent } from '../dialogs/deactivate-profile-request/deactivate-profile-request.component';
@Component({
  selector: 'app-dash-account',
  templateUrl: './dash-account.component.html',
  styleUrls: ['./dash-account.component.scss'],
})
export class DashAccountComponent {

  constructor(
    private dialog: MatDialog,
    private ngFire: AngularFirestore,
    private snackBarService: SnackbarService,
    private authService: AuthService
  ) { }

  onChangeCredentials(changeElement: 'email' | 'password'): void {
    // log out user and then login again
    this.dialog.open(UpdateInfoComponent, {
      data: changeElement,
      autoFocus: false,
      disableClose: true,
    });
  }

  onDeactivateAccount(): void {
    const dialogRef = this.dialog.open(DeactivateProfileRequestComponent, {
      panelClass: 'fk-dialogs',
    });

    dialogRef.afterClosed().subscribe(userResponse => {
      if (userResponse) {
        this.ngFire.collection('tickets').doc(userResponse.id).set(userResponse)
          .then(
            () => {
              this.snackBarService.displayCustomMsg('Account Deactivation Request Submitted!');
              this.authService.onLogout();
            }, err => {
              this.snackBarService.displayError('Request raise failed!');
            }
          )
          .catch(err => this.snackBarService.displayError());
      }
    });
  }
}
