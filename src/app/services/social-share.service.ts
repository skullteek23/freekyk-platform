import { Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { SharesheetComponent } from '../shared/components/sharesheet/sharesheet.component';
import { SharesheetmobileComponent } from '../shared/components/sharesheetmobile/sharesheetmobile.component';
import { ShareData } from '../shared/interfaces/others.model';

@Injectable({
  providedIn: 'root',
})
export class SocialShareService {
  dummy_shareData: ShareData = {
    share_url:
      'https://freekyk8--h-qcd2k7n4.web.app/s/Freekyk%20Football%20Season',
    share_title: 'Freekyk Season',
    share_desc:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
    share_imgpath:
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  };

  onShare(data?: ShareData) {
    if (this.isMobile()) {this.OpenShareSheet(data);}
    else {this.OpenShareDialog(data);}
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
  private isMobile() {
    if (sessionStorage.desktop) {return false;}
    else if (localStorage.mobile) {return true;}
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
    for (const i in mobile)
      {if (
        navigator.userAgent.toLowerCase().indexOf(mobile[i].toLowerCase()) > 0
      )
        {return true;}}
    return false;
  }
  constructor(private _botSheet: MatBottomSheet, private dialog: MatDialog) {}
}
