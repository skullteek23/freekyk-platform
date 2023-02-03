import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from '@app/services/snackbar.service';
import { MatchConstantsSecondary } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { ConfirmationBoxComponent } from '@shared/dialogs/confirmation-box/confirmation-box.component';
import { ISeasonPartner } from '@shared/interfaces/season.model';

export interface ISponsorDialogData {
  editMode: boolean;
  documentID: string;
}

@Component({
  selector: 'app-add-sponsor',
  templateUrl: './add-sponsor.component.html',
  styleUrls: ['./add-sponsor.component.scss']
})
export class AddSponsorComponent implements OnInit {

  readonly messages = formsMessages;

  isLoaderShown = false;
  partnerForm: FormGroup;
  previewFile = '';
  imageUrl = MatchConstantsSecondary.DEFAULT_IMAGE_URL;

  constructor(
    public dialogRef: MatDialogRef<AddSponsorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ISponsorDialogData,
    private ngFire: AngularFirestore,
    private snackbarService: SnackbarService,
    private ngStorage: AngularFireStorage,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.initForm();
    if (this.data.editMode) {
      this.getPartnerInfo();
    }
  }

  getPartnerInfo() {
    this.ngFire.collection('partners').doc(this.data.documentID).get()
      .subscribe({
        next: (response) => {
          if (response && response.exists) {
            const partnerData: ISeasonPartner = response.data() as ISeasonPartner;
            this.partnerForm.patchValue({
              name: partnerData.name,
              website: partnerData.website,
              imgFile: 0
            });
            this.imageUrl = partnerData.imgpath;
          }
        },
        error: () => {
          this.snackbarService.displayError('Unable to retrieve partner info');
          this.partnerForm.reset();
        }
      })
  }

  initForm() {
    this.partnerForm = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.alphaNumberWithSpace)]),
      imgFile: new FormControl(null, Validators.required),
      website: new FormControl(null, [Validators.required]),
    })
  }

  async onSubmit() {
    if (this.partnerForm.invalid || !this.data.documentID || this.data.editMode) {
      return;
    }
    this.isLoaderShown = true;
    const partnerDoc: Partial<ISeasonPartner> = {
      name: this.partnerForm.value?.name?.trim(),
      website: this.partnerForm.value?.website?.trim(),
      seasonID: this.data.documentID
    }
    partnerDoc.imgpath = await this.onUploadImage();
    this.ngFire.collection('partners').add(partnerDoc)
      .then(() => {
        this.snackbarService.displayCustomMsg('Partner added successfully!');
        this.partnerForm.reset();
        this.onCloseDialog();
      })
      .catch(() => this.snackbarService.displayError('Partner add failed!'))
      .finally(() => this.isLoaderShown = false)
  }

  onUpdate() {
    if (this.partnerForm.invalid || !this.data.documentID || !this.data.editMode) {
      return;
    }
    this.isLoaderShown = true;
    const partnerDoc: Partial<ISeasonPartner> = {
      name: this.partnerForm.value?.name?.trim(),
      website: this.partnerForm.value?.website?.trim(),
    }
    this.ngFire.collection('partners').doc(this.data.documentID).update({ ...partnerDoc })
      .then(() => {
        this.snackbarService.displayCustomMsg('Partner details updated successfully!');
        this.partnerForm.reset();
        this.onCloseDialog();
      })
      .catch(() => this.snackbarService.displayError('Partner update failed!'))
      .finally(() => this.isLoaderShown = false)
  }

  remove() {
    this.dialog.open(ConfirmationBoxComponent).afterClosed()
      .subscribe(response => {
        if (response) {
          this.isLoaderShown = true;
          this.ngFire.collection('partners').doc(this.data.documentID).delete()
            .then(() => {
              this.snackbarService.displayCustomMsg('Partner removed successfully!');
              this.partnerForm.reset();
              this.onCloseDialog();
            })
            .catch(() => this.snackbarService.displayError('Partner delete failed!'))
            .finally(() => this.isLoaderShown = false)
        }
      })
  }

  onSetFile(event: File) {
    if (event) {
      this.partnerForm.get('imgFile').setValue(event);
    }
  }

  async onUploadImage(): Promise<any> {
    const uniqueID = this.ngFire.createId();
    const file: File = this.partnerForm.get('imgFile').value;
    return (await this.ngStorage.upload(`/sponsors/sponsor_${file.name}_${uniqueID}`, file)).ref.getDownloadURL();
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }

}
