import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/storage';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import firebase from 'firebase/app';
import { Subscription } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-uploadphoto',
  templateUrl: './uploadphoto.component.html',
  styleUrls: ['./uploadphoto.component.css'],
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
    private snackServ: SnackbarService,
    private ngFire: AngularFirestore,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {}

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
  onRemovePhoto(): Promise<any> {
    if (!this.selectedImage) {
      return;
    }
    this.isLoading = true;
    const uid = localStorage.getItem('uid');
    return this.ngStorage
      .refFromURL(this.selectedImage)
      .delete()
      .toPromise()
      .then(() => {
        this.selectedImage = null;
        this.snackServ.displayCustomMsg('Photo removed Successfully!');
      })
      .catch(() => this.snackServ.displayError())
      .finally(() => {
        this.isLoading = false;
        setTimeout(() => {
          this.onCloseDialog();
        }, 4000);
      });
  }
  async onUploadImage(): Promise<any> {
    this.isLoading = true;
    if (this.$file == null) {
      this.isLoading = false;
      this.snackServ.displayError();
      return this.onCloseDialog();
    }
    const uid = localStorage.getItem('uid');
    this.uploadImageTask = this.ngStorage.upload('image_' + uid, this.$file);
    const downloadURL: string = await this.uploadImageTask.then((res) =>
      res.ref.getDownloadURL()
    );
    return this.ngFire
      .collection(`players/${uid}/additionalInfo`)
      .doc('otherInfo')
      .set(
        {
          imgpath_lg: downloadURL || null,
        },
        { merge: true }
      )
      .then(() => {
        this.isUploadComplete = true;
      })
      .catch(() => this.snackServ.displayError())
      .finally(() => {
        this.isLoading = false;
        setTimeout(() => {
          this.onCloseDialog();
        }, 4000);
      });
  }
}
