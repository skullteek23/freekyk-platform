import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/storage';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import firebase from 'firebase/app';
import { SnackbarService } from '@shared/services/snackbar.service';

@Component({
  selector: 'app-uploadphoto',
  templateUrl: './uploadphoto.component.html',
  styleUrls: ['./uploadphoto.component.scss'],
})
export class UploadphotoComponent implements OnInit, OnDestroy {

  $file: File = null;
  selectedImage = null;
  isLoading = false;
  isUploadComplete = false;
  uploadImageTask: AngularFireUploadTask;
  subscriptions = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<UploadphotoComponent>,
    private ngStorage: AngularFireStorage,
    private snackBarService: SnackbarService,
    private ngFire: AngularFirestore,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) { }

  ngOnInit(): void {
    if (this.data) {
      this.selectedImage = this.data;
    }
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  onCloseDialog(val = 0): void {
    this.dialogRef.close(val);
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
    allPromises.push(this.ngFire.collection(`players/${uid}/additionalInfo`).doc('otherInfo').update({ imgpath_lg: firebase.firestore.FieldValue.delete() }));
    allPromises.push(this.ngFire.collection('players').doc(uid).update({ imgpath_sm: firebase.firestore.FieldValue.delete() }));
    Promise.all(allPromises)
      .then(() => {
        this.selectedImage = null;
        this.snackBarService.displayCustomMsg('Photo removed successfully!');
      })
      .catch(() => this.snackBarService.displayError())
      .finally(() => {
        this.isLoading = false;
        this.onCloseDialog(1);
      });
  }

  async onUploadImage(): Promise<any> {
    this.isLoading = true;
    if (this.$file === null) {
      this.isLoading = false;
      this.snackBarService.displayError();
      return this.onCloseDialog(0);
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
          this.onCloseDialog(1);
        });
    }
  }
}
