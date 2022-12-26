import { Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { ShareData, SharesheetComponent } from '@shared/components/sharesheet/sharesheet.component';
import { SharesheetmobileComponent } from '@shared/components/sharesheetmobile/sharesheetmobile.component';

@Injectable({
  providedIn: 'root',
})
export class SocialShareService {

  constructor(
    private _botSheet: MatBottomSheet,
    private dialog: MatDialog
  ) { }

  onShare(data?: ShareData) {
    if (this.isMobile) {
      this.OpenShareSheet(data);
    }
    else {
      this.OpenShareDialog(data);
    }
  }

  private OpenShareSheet(data: ShareData) {
    this._botSheet.open(SharesheetmobileComponent, {
      data,
      restoreFocus: false,
    });
  }

  private OpenShareDialog(data?: ShareData) {
    this.dialog.open(SharesheetComponent, {
      data,
      restoreFocus: false,
    });
  }

  get isMobile() {
    if (sessionStorage.desktop) {
      return false;
    }
    else if (localStorage.mobile) {
      return true;
    }
    const mobile = [
      'iphone',
      'ipad',
      'android',
      'blackberry',
      'nokia',
      'opera mini',
      'windows mobile',
      'windows phone',
      'iemobile',
    ];
    for (const i in mobile) {
      if (navigator.userAgent.toLowerCase().indexOf(mobile[i].toLowerCase()) > 0) {
        return true;
      }
    }
    return false;
  }

}
