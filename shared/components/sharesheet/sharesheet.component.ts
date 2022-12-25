import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ShareData } from '../../interfaces/others.model';

@Component({
  selector: 'app-sharesheet',
  templateUrl: './sharesheet.component.html',
  styleUrls: ['./sharesheet.component.scss'],
})
export class SharesheetComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SharesheetComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ShareData,
    public _clipboard: Clipboard
  ) { }

  onCloseDialog() {
    this.dialogRef.close();
  }

  ngOnInit(): void { }

  onCopyLink(link: string) {
    this._clipboard.copy(link);
  }
}
