import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'environments/environment';
import { SnackbarService } from '@shared/services/snackbar.service';
export function replaceAll(search: string, replacement: string, target: string): string {
  return target.replace(new RegExp(search, 'g'), replacement);
};
export class ShareData {
  share_url: string;
  share_title: string;
  share_desc: string;
  share_imgpath: string;

  get url(): any {
    return replaceAll(" ", "%20", this.share_url.trim())
  }
}
@Component({
  selector: 'app-sharesheet',
  templateUrl: './sharesheet.component.html',
  styleUrls: ['./sharesheet.component.scss'],
})
export class SharesheetComponent implements OnInit {

  readonly url = environment.firebase.url;
  readonly imageUrl = environment.firebase.logoURL;

  constructor(
    public dialogRef: MatDialogRef<SharesheetComponent>,
    public _clipboard: Clipboard,
    private snackbarService: SnackbarService,
    @Inject(MAT_DIALOG_DATA) public data: ShareData,
  ) { }

  onCloseDialog() {
    this.dialogRef.close();
  }

  ngOnInit(): void { }

  onCopyLink(link: string) {
    this._clipboard.copy(link);
    this.snackbarService.displayCustomMsg('Link Copied');
  }
}
