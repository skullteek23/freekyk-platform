import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'environments/environment';
import { ShareData } from '../../interfaces/others.model';
import { SnackbarService } from 'src/app/services/snackbar.service';

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
