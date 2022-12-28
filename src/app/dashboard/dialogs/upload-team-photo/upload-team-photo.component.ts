import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireUploadTask, AngularFireStorage } from '@angular/fire/storage';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from '@app/services/snackbar.service';
import { YES_OR_NO_OPTIONS } from '@shared/constants/constants';
import { ListOption } from '@shared/interfaces/others.model';
import { firestoreCustomType } from '@shared/interfaces/user.model';
import { Subscription } from 'rxjs';
import { TeamBasicInfo } from '@shared/interfaces/team.model';

@Component({
  selector: 'app-upload-team-photo',
  templateUrl: './upload-team-photo.component.html',
  styleUrls: ['./upload-team-photo.component.scss']
})
export class UploadTeamPhotoComponent implements OnInit, OnDestroy {

  readonly options: ListOption[] = [
    { viewValue: 'Team Photo', value: 'imgpath' },
    { viewValue: 'Team Logo', value: 'imgpath_logo' },
  ];

  photoType = 'imgpath';
  previewFile = '';
  selectedPhoto$: File = null;
  isUploadComplete = false;
  isLoading = false;
  subscriptions = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<UploadTeamPhotoComponent>,
    private ngStorage: AngularFireStorage,
    private snackBarService: SnackbarService,
    private ngFire: AngularFirestore,
  ) { }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  onCloseDialog(): void {
    location.reload();
    // this.dialogRef.close();
  }

  onChooseImage(ev: any): void {
    this.selectedPhoto$ = ev.target.files[0];
    this.onShowPreview();
  }

  onShowPreview(): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewFile = reader.result as string;
    };
    reader.readAsDataURL(this.selectedPhoto$);
  }

  async upload(): Promise<any> {
    if (!this.selectedPhoto$ || !this.photoType) {
      return;
    }
    this.isLoading = true;
    const tid = sessionStorage.getItem('tid');
    const update: Partial<TeamBasicInfo> = {};
    update[this.photoType] = await this.getPhotoUrl(tid);
    this.ngFire.collection('teams').doc(tid)
      .update({ ...update })
      .then(() => {
        this.isUploadComplete = true;
        this.selectedPhoto$ = null;
        const textToShow = this.photoType === 'imgpath' ? 'Photo' : 'Logo';
        this.snackBarService.displayCustomMsg(textToShow + ' modified successfully!');
      })
      .catch(() => this.snackBarService.displayError())
      .finally(() => {
        this.isLoading = false;
        setTimeout(() => {
          this.onCloseDialog();
        }, 3000);
      });
  }

  async getPhotoUrl(tid: string) {
    if (this.photoType === 'imgpath') {
      return await this.onUploadTeamPhoto(tid);
    } else {
      return await this.onUploadTeamLogo(tid);
    }
  }

  async onUploadTeamLogo(tid: string): Promise<any> {
    return (await this.ngStorage.upload('/teamLogos/team_logo_' + tid, this.selectedPhoto$)).ref.getDownloadURL();
  }

  async onUploadTeamPhoto(tid: string): Promise<any> {
    return (await this.ngStorage.upload('/teamsImages/team_photo_' + tid, this.selectedPhoto$)).ref.getDownloadURL();
  }
}
