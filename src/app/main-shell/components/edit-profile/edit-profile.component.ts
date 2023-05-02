import { AuthService } from '@app/services/auth.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GenerateRewardService } from '@app/main-shell/services/generate-reward.service';
import { authUserMain } from '@app/services/auth.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { ImageUploadPaths } from '@shared/constants/constants';
import { RewardableActivities } from '@shared/interfaces/reward.model';
import { IPlayer } from '@shared/interfaces/user.model';
import { ApiGetService, ApiPostService } from '@shared/services/api.service';
import { StorageApiService } from '@shared/services/storage-api.service';
import { RemoveUnchangedKeysFromFormGroup } from '@shared/utils/custom-functions';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {

  player: Partial<IPlayer> = null;
  user: authUserMain = null;
  isLoaderShown = false;

  @ViewChild(ProfileComponent) profileComponent: ProfileComponent;

  constructor(
    private dialog: MatDialog,
    private apiService: ApiGetService,
    private apiPostService: ApiPostService,
    private snackBarService: SnackbarService,
    private authService: AuthService,
    private storageApiService: StorageApiService,
    private generateRewardService: GenerateRewardService
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
    if (this.profileComponent?.infoForm?.valid && this.profileComponent?.infoForm?.dirty && this.user) {
      this.isLoaderShown = true;
      const url = await this.storageApiService.getPublicUrl(this.profileComponent.infoForm.value.imgpath, ImageUploadPaths.profilePhoto + `${this.user.uid}`);
      const value = RemoveUnchangedKeysFromFormGroup(this.profileComponent?.infoForm, this.player);
      if (url) {
        value.imgpath = url;
      }
      if (Object.keys(value).length) {
        this.apiPostService.updatePlayerInfo(this.user.uid, value)
          .then(() => {
            this.snackBarService.displayCustomMsg('Changes saved successfully!')
            this.getPlayerInfo();
            this.generateRewardService.completeActivity(RewardableActivities.completeProfile, this.user.uid);
          })
          .catch(error => {
            this.snackBarService.displayError('Error: Unable to save changes!');
          })
          .finally(() => {
            this.isLoaderShown = false;
          })
      } else {
        this.isLoaderShown = false;
        this.snackBarService.displayError(`Error: Required field(s) can't be empty!`)
      }
    }
  }
}
