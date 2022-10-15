import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FileUploadMessages } from '../../constants/messages';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.css']
})
export class FileUploaderComponent {

  fileName = 'Select File';
  uploadedImageFile$: File = null;
  messages = FileUploadMessages;

  @Input() error = false;
  @Output() changeUpload = new EventEmitter<File>();

  onSelectFile(fileEvent) {
    this.uploadedImageFile$ = fileEvent.target.files[0];
    fileEvent.target.value = null;
    if (this.uploadedImageFile$) {
      this.fileName = this.uploadedImageFile$.name;
      this.changeUpload.emit(this.uploadedImageFile$);
    }
  }

  deleteFile() {
    this.fileName = 'Select File';
    this.uploadedImageFile$ = null;
    this.changeUpload.emit(this.uploadedImageFile$);
  }
}
