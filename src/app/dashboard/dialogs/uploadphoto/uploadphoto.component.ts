import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/storage';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar.service';

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
        this.snackBarService.displayCustomMsg('Photo removed Successfully!');
      })
      .catch(() => this.snackBarService.displayError())
      .finally(() => {
        this.isLoading = false;
        this.onCloseDialog();
      });
  }

  async onUploadImage(): Promise<any> {
    this.isLoading = true;
    if (this.$file == null) {
      this.isLoading = false;
      this.snackBarService.displayError();
      return this.onCloseDialog();
    }
    const uid = localStorage.getItem('uid');
    this.uploadImageTask = this.ngStorage.upload('/profileImages/image_' + uid, this.$file);
    const downloadURL: string = await this.uploadImageTask.then((res) => res.ref.getDownloadURL());
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
      .catch(() => this.snackBarService.displayError())
      .finally(() => {
        this.isLoading = false;
        this.onCloseDialog();
      });
  }
}
