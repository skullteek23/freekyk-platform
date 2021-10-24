import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import firebase from 'firebase/app';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-uploadphoto',
  templateUrl: './uploadphoto.component.html',
  styleUrls: ['./uploadphoto.component.css'],
})
export class UploadphotoComponent implements OnInit {
  $file: File = null;
  selectedImage = null;
  isLoading = false;
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
    this.ngStorage
      .upload('image_' + uid, this.$file)
      .percentageChanges()
      .toPromise()
      .then((res) => {
        console.log(res);
        if (res === 100) {
          this.snackServ.displayCustomMsg('Photo uploaded Successfully!');
          this.onSuccessOperation();
        }
      });
  }
  onSuccessOperation(): void {
    this.onCloseDialog();
    this.isLoading = false;
  }
}
