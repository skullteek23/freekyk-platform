import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatchConstantsSecondary } from '../../constants/constants';

@Component({
  selector: 'app-photo-uploader',
  templateUrl: './photo-uploader.component.html',
  styleUrls: ['./photo-uploader.component.scss']
})
export class PhotoUploaderComponent {

  @Output() changeUpload = new EventEmitter<File>();
  @Input() actionBtnLabel = 'Browse Photo';
  @Input() url: string = MatchConstantsSecondary.DEFAULT_IMAGE_URL;
  // defaultImgUrl = MatchConstantsSecondary.DEFAULT_IMAGE_URL;

  preview: string = null;
  $uploadedImageFile: File = null;

  onBrowsePhoto(ev, previewEl: HTMLElement): void {
    // const preview: any = document.getElementById('preview-image');
    if (ev && ev.target && ev.target.files) {
      const file = ev.target.files[0];
      previewEl['src'] = URL.createObjectURL(file);
      this.emitSelection(file);
    }
  }

  emitSelection(file) {
    this.changeUpload.emit(file);
  }

  resetImage(): void {
    this.preview = null;
    this.$uploadedImageFile = null;
  }
}
