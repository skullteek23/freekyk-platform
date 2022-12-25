import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Inject, OnInit } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA, } from '@angular/material/bottom-sheet';
import { SnackbarService } from '@app/services/snackbar.service';
import { environment } from 'environments/environment';
import { ShareData } from '../../interfaces/others.model';

@Component({
  selector: 'app-sharesheetmobile',
  templateUrl: './sharesheetmobile.component.html',
  styleUrls: ['./sharesheetmobile.component.scss'],
})
export class SharesheetmobileComponent implements OnInit {

  readonly url = environment.firebase.url;
  readonly imageUrl = environment.firebase.logoURL;
  readonly socials = [
    'facebook',
    'twitter',
    // 'linkedin',
    'whatsapp',
    // 'pinterest'
  ];

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<SharesheetmobileComponent>,
    public _clipboard: Clipboard,
    private snackbarService: SnackbarService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: ShareData,
  ) { }

  ngOnInit(): void { }

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

  onCopyLink(link: string) {
    this._clipboard.copy(link);
    this.snackbarService.displayCustomMsg('Link Copied');
  }
}
