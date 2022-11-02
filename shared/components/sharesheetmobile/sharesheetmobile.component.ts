import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Inject, OnInit } from '@angular/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { ShareData } from '../../interfaces/others.model';

@Component({
  selector: 'app-sharesheetmobile',
  templateUrl: './sharesheetmobile.component.html',
  styleUrls: ['./sharesheetmobile.component.scss'],
})
export class SharesheetmobileComponent implements OnInit {
  socials = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'pinterest'];
  constructor(
    private _bottomSheetRef: MatBottomSheetRef<SharesheetmobileComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: ShareData,
    public _clipboard: Clipboard
  ) {}

  ngOnInit(): void {}
  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
  onCopyLink(link: string) {
    this._clipboard.copy(link);
  }
}
