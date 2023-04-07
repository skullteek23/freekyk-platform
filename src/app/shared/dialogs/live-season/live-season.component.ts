import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EnlargeService } from '@app/services/enlarge.service';
import { SocialShareService } from '@app/services/social-share.service';
import { ShareData } from '@shared/components/sharesheet/sharesheet.component';
import { ISeason, SeasonBasicInfo } from '@shared/interfaces/season.model';

@Component({
  selector: 'app-live-season',
  templateUrl: './live-season.component.html',
  styleUrls: ['./live-season.component.scss']
})
export class LiveSeasonComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<LiveSeasonComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ISeason,
    private enlargeService: EnlargeService,
    private socialShareService: SocialShareService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  onEnlargeImage() {
    this.enlargeService.onOpenPhoto(this.data.imgpath);
  }

  onNavigate() {
    this.router.navigate(['/s', this.data.id])
    this.onCloseDialog();
  }

  onShare() {
    const data = new ShareData();
    data.share_url = `/s/${this.data.name}`;
    data.share_title = this.data.name;
    this.socialShareService.onShare(data);
  }
}
