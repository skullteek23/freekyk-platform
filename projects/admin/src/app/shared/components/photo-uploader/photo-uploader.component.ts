import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatchConstantsSecondary } from '../../constants/constants';

@Component({
  selector: 'app-photo-uploader',
  templateUrl: './photo-uploader.component.html',
  styleUrls: ['./photo-uploader.component.css']
})
export class PhotoUploaderComponent {

  @Output() changeUpload = new EventEmitter<File>();
  @Input() defaultImgUrl = MatchConstantsSecondary.DEFAULT_IMAGE_URL;

  preview = null;
  $uploadedImageFile: File = null;

  onBrowsePhoto(ev): void {
    if (ev && ev.target && ev.target.files) {
      const src = URL.createObjectURL(ev.target.files[0]);
      const preview: any = document.getElementById('preview-image');
      const file = ev.target.files[0];
      preview.src = src;
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
