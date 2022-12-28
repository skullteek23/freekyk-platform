import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireUploadTask, AngularFireStorage } from '@angular/fire/storage';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from '@app/services/snackbar.service';
import { YES_OR_NO_OPTIONS } from '@shared/constants/constants';
import { firestoreCustomType } from '@shared/interfaces/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-upload-team-photo',
  templateUrl: './upload-team-photo.component.html',
  styleUrls: ['./upload-team-photo.component.scss']
})
export class UploadTeamPhotoComponent implements OnInit {

  readonly options = YES_OR_NO_OPTIONS;

  $file: File = null;
  selectedImage = null;
  isLoading = false;
  isUploadComplete = false;
  uploadImageTask: AngularFireUploadTask;
  subscriptions = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<UploadTeamPhotoComponent>,
    private ngStorage: AngularFireStorage,
    private snackBarService: SnackbarService,
    private ngFire: AngularFirestore,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) { }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }

  onChooseImage(ev: any): void {
    this.$file = ev.target.files[0];
    this.onShowPreview();
  }

  onShowPreview(): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImage = reader.result as string;
    };
    reader.readAsDataURL(this.$file);
  }

  onRemovePhoto(): void {
    if (!this.selectedImage) {
      return;
    }
    this.isLoading = true;
    const uid = localStorage.getItem('uid');
    const allPromises = [];
    allPromises.push(this.ngFire.collection(`players/${uid}/additionalInfo`).doc('otherInfo').update({ imgpath_lg: firestoreCustomType.FieldValue.delete() }));
    allPromises.push(this.ngFire.collection('players').doc(uid).update({ imgpath_sm: firestoreCustomType.FieldValue.delete() }));
    Promise.all(allPromises)
      .then(() => {
        this.selectedImage = null;
        this.snackBarService.displayCustomMsg('Photo removed successfully!');
      })
      .catch(() => this.snackBarService.displayError())
      .finally(() => {
        this.isLoading = false;
        this.onCloseDialog();
      });
  }

  async onUploadImage(): Promise<any> {
    this.isLoading = true;
    if (this.$file === null) {
      this.isLoading = false;
      this.snackBarService.displayError();
      return this.onCloseDialog();
    }
    const uid = localStorage.getItem('uid');
    this.uploadImageTask = this.ngStorage.upload('/profileImages/profileimage_' + uid, this.$file);
    const downloadURL: string = await this.uploadImageTask.then((res) => res.ref.getDownloadURL());
    if (downloadURL) {
      return this.ngFire
        .collection(`players/${uid}/additionalInfo`)
        .doc('otherInfo')
        .set({ imgpath_lg: downloadURL, }, { merge: true })
        .then(() => {
          this.isUploadComplete = true;
        })
        .catch(() => this.snackBarService.displayError())
        .finally(() => {
          this.isLoading = false;
          this.onCloseDialog();
        });
    }
  }
}
