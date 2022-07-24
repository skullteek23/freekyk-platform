import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.css']
})
export class FileUploaderComponent implements OnInit {
  $uploadedImageFile: File = null;
  @Output() changeUpload = new EventEmitter<File>();
  fileName: string = '';
  constructor() { }

  ngOnInit(): void {
  }

  onSelectFile(fileEvent) {
    const file = fileEvent.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.changeUpload.emit(file);
    }
  }
}
