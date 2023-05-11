import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SnackbarService } from '@shared/services/snackbar.service';
import { MatchConstantsSecondary, ProfileConstants } from '../../constants/constants';

@Component({
  selector: 'app-photo-uploader',
  templateUrl: './photo-uploader.component.html',
  styleUrls: ['./photo-uploader.component.scss']
})
export class PhotoUploaderComponent {

  @Output() changeUpload = new EventEmitter<File>();
  @Input() actionBtnLabel = 'Browse Photo';
  @Input() url: string = MatchConstantsSecondary.DEFAULT_IMAGE_URL;

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
