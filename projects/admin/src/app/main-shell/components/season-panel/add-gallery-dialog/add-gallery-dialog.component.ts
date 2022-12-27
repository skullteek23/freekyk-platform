import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from '@app/services/snackbar.service';
import { SeasonMedia } from '@shared/interfaces/season.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-add-gallery-dialog',
  templateUrl: './add-gallery-dialog.component.html',
  styleUrls: ['./add-gallery-dialog.component.scss']
})
export class AddGalleryDialogComponent implements OnInit {

  photosList: string[];
  isLoaderShown = false;
  isAddNew = false;
  selectedPhoto$: File = null;
  uploadImageTask: AngularFireUploadTask;

  constructor(
    public dialogRef: MatDialogRef<AddGalleryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public seasonID: string,
    private ngFire: AngularFirestore,
    private snackbarService: SnackbarService,
    private ngStorage: AngularFireStorage
  ) { }

  ngOnInit(): void {
    if (this.seasonID) {
      this.isLoaderShown = true;
      this.ngFire.collection(`seasons/${this.seasonID}/additionalInfo`).doc('media')
        .get()
        .pipe(
          map((resp) => {
            const data = resp.data() as SeasonMedia;
            if (resp.exists && data) {
              return data.photos;
            } else {
              return [];
            }
          })
        )
        .subscribe({
          next: (response) => {
            this.photosList = response?.length ? response : [];
            this.isLoaderShown = false;
          },
          error: () => {
            this.snackbarService.displayError();
            this.isLoaderShown = false;
          }
        });
    }
  }

  onSelectPhoto(selection: File) {
    if (selection) {
      this.selectedPhoto$ = selection;
    }
  }

  async uploadPhoto() {
    if (this.selectedPhoto$) {
      this.isLoaderShown = true;
      const fileName = `/seasonGallery/image_${this.seasonID}_${this.selectedPhoto$.name}`
      this.uploadImageTask = this.ngStorage.upload(fileName, this.selectedPhoto$);
      const downloadURL: string = await this.uploadImageTask.then((res) => res.ref.getDownloadURL());
      this.photosList.push(downloadURL);
      return this.ngFire
        .collection(`seasons/${this.seasonID}/additionalInfo`)
        .doc('media')
        .update({ photos: this.photosList })
        .then(() => {
          this.snackbarService.displayCustomMsg('Photo Uploaded successfully!')
        })
        .catch(() => this.snackbarService.displayError())
        .finally(() => {
          this.selectedPhoto$ = null;
          this.isLoaderShown = false;
          this.onCloseDialog();
        });
    }
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }

  onAddNew() {
    this.isAddNew = true;
  }
}
