import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService, authUserMain } from '@app/services/auth.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { AccProfileComponent } from './acc-profile/acc-profile.component';
import { ApiGetService, ApiPostService } from '@shared/services/api.service';
import { RemoveUnchangedKeysFromFormGroup } from '@shared/utils/custom-functions';
import { StorageApiService } from '@shared/services/storage-api.service';
import { ImageUploadPaths } from '@shared/constants/constants';
import { IPlayer } from '@shared/interfaces/user.model';
@Component({
  selector: 'app-dash-account',
  templateUrl: './dash-account.component.html',
  styleUrls: ['./dash-account.component.scss'],
})
export class DashAccountComponent implements OnInit {

  player: Partial<IPlayer> = null;
  user: authUserMain = null;
  isLoaderShown = false;

  @ViewChild(AccProfileComponent) accProfileComponent: AccProfileComponent;

  constructor(
    private dialog: MatDialog,
    private apiService: ApiGetService,
    private apiPostService: ApiPostService,
    private snackBarService: SnackbarService,
    private authService: AuthService,
    private storageApiService: StorageApiService
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe({
      next: user => {
        this.user = user;
        this.getPlayerInfo();
      }
    });
  }

  getPlayerInfo() {
    this.isLoaderShown = true;
    this.apiService.getPlayer(this.user.uid).subscribe({
      next: (response) => {
        this.player = response;
        this.isLoaderShown = false;
      },
      error: () => {
        this.player = null;
        this.isLoaderShown = false;
        this.snackBarService.displayError('Error: Unable to get player info!');
      }
    })
  }

  onChangeCredentials(changeElement: 'email' | 'password'): void {
    // // log out user and then login again
    // this.dialog.open(UpdateInfoComponent, {
    //   data: changeElement,
    //   autoFocus: false,
    //   disableClose: true,
    // });
  }

  onDeactivateAccount(): void {
    // const dialogRef = this.dialog.open(DeactivateProfileRequestComponent, {
    //   panelClass: 'fk-dialogs',
    // });

    // dialogRef.afterClosed().subscribe(userResponse => {
    //   if (userResponse) {
    //     this.ngFire.collection('tickets').doc(userResponse.id).set(userResponse)
    //       .then(
    //         () => {
    //           this.snackBarService.displayCustomMsg('Account Deactivation Request Submitted!');
    //           this.authService.onLogout();
    //         }, err => {
    //           this.snackBarService.displayError('Request raise failed!');
    //         }
    //       )
    //       .catch(err => this.snackBarService.displayError());
    //   }
    // });
  }

  async saveChanges() {
    if (this.accProfileComponent?.infoForm?.valid && this.accProfileComponent?.infoForm?.dirty && this.user) {
      this.isLoaderShown = true;
      const url = await this.storageApiService.getPublicUrl(this.accProfileComponent.infoForm.value.imgpath, ImageUploadPaths.profilePhoto + `${this.user.uid}`);
      const value = RemoveUnchangedKeysFromFormGroup(this.accProfileComponent?.infoForm, this.player);
      if (url) {
        value.imgpath = url;
      }
      this.apiPostService.updatePlayerInfo(this.user.uid, value)
        .then(() => {
          this.snackBarService.displayCustomMsg('Changes saved successfully!')
          this.getPlayerInfo();
        })
        .catch(error => {
          this.snackBarService.displayError('Error: Unable to save changes');
        })
        .finally(() => {
          this.isLoaderShown = false;
        })
    }
  }
}
