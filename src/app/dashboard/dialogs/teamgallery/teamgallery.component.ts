import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatDialogRef } from '@angular/material/dialog';
import firebase from 'firebase/app';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { TeamMedia } from 'src/app/shared/interfaces/team.model';

@Component({
  selector: 'app-teamgallery',
  templateUrl: './teamgallery.component.html',
  styleUrls: ['./teamgallery.component.css'],
})
export class TeamgalleryComponent implements OnInit {
  noGallery = false;
  isLoading = false;
  teamGallery$: Observable<TeamMedia>;
  showEditButtons = false;
  newSub: Subscription;
  deleteInProgress$: Observable<boolean>;
  constructor(
    public dialogRef: MatDialogRef<TeamgalleryComponent>,
    private ngFire: AngularFirestore,
    private ngStorage: AngularFireStorage,
    private snackServ: SnackbarService
  ) { }

  ngOnInit(): void {
    this.getGalleryPhotos();
  }
  onCloseDialog(): void {
    this.dialogRef.close();
  }
  async onChoosePhoto(ev: any): Promise<any> {
    this.isLoading = true;
    const teamPhoto = ev.target.files[0];
    const tid = sessionStorage.getItem('tid');
    if (!!teamPhoto) {
      const uploadRef = await this.ngStorage.upload(
        `/teamGallery/${tid}${teamPhoto.name}`,
        teamPhoto
      );
      uploadRef.ref.getDownloadURL().then((url) => {
        let photoSnap;
        if (!this.noGallery) {
          photoSnap = this.ngFire
            .collection(`teams/${tid}/additionalInfo`)
            .doc('media')
            .update({
              media: firebase.firestore.FieldValue.arrayUnion(url),
            });
        } else {
          photoSnap = this.ngFire
            .collection(`teams/${tid}/additionalInfo`)
            .doc('media')
            .set({
              media: [url],
            });
        }
        photoSnap
          .then(() => this.cleanUp('Photo uploaded successfully!'))
          .catch((err => this.snackServ.displayError()));
      });
    }
  }
  cleanUp(message: string): void {
    this.isLoading = false;
    this.snackServ.displayCustomMsg(message);
    this.onCloseDialog();
  }
  onHover(state: boolean): void {
    this.showEditButtons = state;
  }
  onRemovePhoto(photoUrl: string): void {
    const tid = sessionStorage.getItem('tid');
    this.deleteInProgress$ = this.ngFire
      .collection(`teams/${tid}/additionalInfo`)
      .doc('media')
      .get()
      .pipe(
        switchMap((val) => {
          const mediaLocal = (val.data() as TeamMedia).media;
          mediaLocal.splice(
            mediaLocal.findIndex((media) => media === photoUrl),
            1
          );
          return this.ngFire
            .collection(`teams/${tid}/additionalInfo`)
            .doc('media')
            .update({
              media: mediaLocal,
            });
        }),
        tap(() => this.cleanUp('Photo deleted successfully!')),
        map(() => true)
      );
  }
  getGalleryPhotos(): void {
    const tid = sessionStorage.getItem('tid');
    this.teamGallery$ = this.ngFire
      .collection(`teams/${tid}/additionalInfo`)
      .doc('media')
      .get()
      .pipe(
        tap((resp) => {
          this.noGallery = resp.exists === false;
          this.isLoading = false;
        }),
        map((resp) => resp.data() as TeamMedia)
      );
  }
}
