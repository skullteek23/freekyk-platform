import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatchConstantsSecondary } from '../../constants/constants';

@Component({
  selector: 'app-photo-uploader',
  templateUrl: './photo-uploader.component.html',
  styleUrls: ['./photo-uploader.component.css']
})
export class PhotoUploaderComponent implements OnInit {
  preview = null;
  $uploadedImageFile: File = null;
  @Input() defaultImgUrl = MatchConstantsSecondary.DEFAULT_IMAGE_URL;
  @Output() changeUpload = new EventEmitter<File>();
  constructor() { }

  ngOnInit(): void {
  }

  onBrowsePhoto(ev): void {
    if (ev && ev.target && ev.target.files) {
      const src = URL.createObjectURL(ev.target.files[0]);
      const preview = document.getElementById("preview-image");
      const file = ev.target.files[0];
      preview['src'] = src;
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
