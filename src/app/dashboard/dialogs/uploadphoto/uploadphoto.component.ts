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
  uploadProgress = 0;
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
  onRemovePhoto(): void {
    if (!this.selectedImage) {
      return;
    }
    this.isLoading = true;
    const uid = localStorage.getItem('uid');
    const allPromises = [];
    allPromises.push(
      this.ngStorage.refFromURL(this.selectedImage).delete().toPromise()
    );
    allPromises.push(
      this.ngFire
        .collection(`players/${uid}/additionalInfo`)
        .doc('otherInfo')
        .update({ imgpath_lg: firebase.firestore.FieldValue.delete() })
    );
    allPromises.push(
      this.ngFire
        .collection('players')
        .doc(uid)
        .update({ imgpath_sm: firebase.firestore.FieldValue.delete() })
    );
    allPromises.push(
      this.ngFire
        .collection('freestylers')
        .doc(uid)
        .update({ imgpath_sm: firebase.firestore.FieldValue.delete() })
    );
    Promise.all(allPromises)
      .then(() =>
        this.snackServ.displayCustomMsg('Photo removed Successfully!')
      )
      .catch((err) => this.snackServ.displayCustomMsg(err))
      .finally(() => {
        this.onCloseDialog();
        this.isLoading = false;
      });
  }
  onUploadImage(): void {
    if (this.$file == null) {
      return;
    }
    this.isLoading = true;
    const uid = localStorage.getItem('uid');
    this.uploadImageTask = this.ngStorage.upload('image_' + uid, this.$file);
    this.subscriptions.add(
      this.uploadImageTask.percentageChanges().subscribe((res) => {
        this.uploadProgress = res;
        if (res === 100) {
          this.isLoading = false;
          this.uploadProgress = null;
          this.isUploadComplete = true;
          this.snackServ.displayCustomMsg('Photo uploaded Successfully!');
          this.onCloseDialog();
        }
      })
    );
  }
  onCancelRunningUpload(): void {
    if (this.uploadImageTask.cancel()) {
      this.isLoading = false;
      this.uploadProgress = 0;
      this.isUploadComplete = false;
      this.snackServ.displayCustomMsg('Upload cancelled!');
    }
  }
}
