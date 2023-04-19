import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SnackbarService } from '@app/services/snackbar.service';
import { MatchConstantsSecondary, ProfileConstants } from '@shared/constants/constants';

@Component({
  selector: 'app-photo-uploading-circle',
  templateUrl: './photo-uploading-circle.component.html',
  styleUrls: ['./photo-uploading-circle.component.scss']
})
export class PhotoUploadingCircleComponent {

  @Output() changeUpload = new EventEmitter<File>();
  @Input() actionBtnLabel = 'Browse Photo';
  @Input() url: string = 'assets/images/grey-bg.png';

  readonly ACCEPTED_TYPES = ProfileConstants.ALLOWED_PHOTO_FILE_TYPES_TEAM;

  @ViewChild('preview') previewContainer: HTMLElement;

  $uploadedImageFile: File = null;

  constructor(
    private snackBarService: SnackbarService
  ) { }

  onBrowsePhoto(ev, previewEl: HTMLElement): void {
    // const preview: any = document.getElementById('preview-image');
    const file = ev?.target?.files && ev?.target?.files[0] ? ev?.target?.files[0] : null;
    if (file && this.ACCEPTED_TYPES.includes(file.type)) {
      previewEl['src'] = URL.createObjectURL(file);
      this.emitSelection(file);
    } else {
      this.snackBarService.displayError('Invalid Photo Format!');
    }
  }

  emitSelection(file) {
    this.changeUpload.emit(file);
  }

  resetImage(): void {
    this.$uploadedImageFile = null;
  }

  get types(): string {
    return this.ACCEPTED_TYPES.join(", ");
  }

  setManualPreview(imgpath: string) {
    if (imgpath) {
      this.previewContainer['nativeElement']['src'] = imgpath;
      this.resetImage();
    }
  }

}
