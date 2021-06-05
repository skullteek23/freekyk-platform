import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatDialogRef } from '@angular/material/dialog';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-uploadphoto',
  templateUrl: './uploadphoto.component.html',
  styleUrls: ['./uploadphoto.component.css'],
})
export class UploadphotoComponent implements OnInit {
  $file: File = null;
  selectedImage = null;
  constructor(
    public dialogRef: MatDialogRef<UploadphotoComponent>,
    private ngStorage: AngularFireStorage,
    private snackServ: SnackbarService,
    private ngFire: AngularFirestore
  ) {
    // ngStorage.upload('')
  }

  ngOnInit(): void {}
  onCloseDialog() {
    this.dialogRef.close();
  }
  onChooseImage(ev: any) {
    this.$file = ev.target.files[0];
  }
  async onUploadImage() {
    if (this.$file == null) return;
    let storageSnap = await this.ngStorage.upload(
      '/profilePicturesLg' + Math.random() + this.$file.name,
      this.$file
    );
    this.selectedImage = await storageSnap.ref.getDownloadURL();
    console.log(this.selectedImage);
    if (this.updateProfilePhoto(this.selectedImage))
      this.snackServ.displayCustomMsg('Image uploaded Successfully!');
    this.onCloseDialog();
  }
  updateProfilePhoto(imgpath: string) {
    const uid = localStorage.getItem('uid');
    console.log(uid);
    let allPromises = [];
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

  // onFileSelected() {
  //   const inputNode: any = document.querySelector('#file');

  //   if (typeof (FileReader) !== 'undefined') {
  //     const reader = new FileReader();

  //     reader.onload = (e: any) => {
  //       this.srcResult = e.target.result;
  //     };

  //     reader.readAsArrayBuffer(inputNode.files[0]);
  //   }
  // }
}
