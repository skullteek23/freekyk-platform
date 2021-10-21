import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { CLOUD_STORAGE_ADDRESS_LARGE } from '../../constants/constants';

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
    this.ngStorage
      .refFromURL(this.selectedImage)
      .delete()
      .toPromise()
      .then(() => {
        this.snackServ.displayCustomMsg('Image removed Successfully!');
        this.onSuccessOperation();
      })
      .catch((err) => {
        console.log(err);
        this.snackServ.displayCustomMsg(err);
      });
  }
  async onUploadImage(): Promise<void> {
    if (this.$file == null) {
      return;
    }
    this.isLoading = true;
    const uid = localStorage.getItem('uid');
    const storageSnap = await this.ngStorage.upload(
      CLOUD_STORAGE_ADDRESS_LARGE + uid,
      this.$file
    );
    this.selectedImage = await storageSnap.ref.getDownloadURL();
    if (this.updateProfilePhoto(this.selectedImage)) {
      this.snackServ.displayCustomMsg('Image uploaded Successfully!');
      this.onSuccessOperation();
    }
  }
  onSuccessOperation(): void {
    this.onCloseDialog();
    this.isLoading = false;
  }
  updateProfilePhoto(imgpath: string): Promise<any[]> {
    const uid = localStorage.getItem('uid');
    console.log(uid);
    const allPromises = [];
    allPromises.push(
      this.ngFire.collection('players').doc(uid).update({
        imgpath_sm: imgpath,
      })
    );
    allPromises.push(
      this.ngFire
        .collection('players/' + uid + '/additionalInfo')
        .doc('otherInfo')
        .set(
          {
            imgpath_lg: imgpath,
          },
          { merge: true }
        )
    );
    allPromises.push(
      this.ngFire.collection('freestylers').doc(uid).update({
        imgpath_lg: imgpath,
      })
    );

    return Promise.all(allPromises);
  }
}
