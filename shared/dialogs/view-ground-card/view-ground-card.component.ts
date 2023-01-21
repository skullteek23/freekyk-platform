import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EnlargeService } from '@app/services/enlarge.service';
import { SocialShareService } from '@app/services/social-share.service';
import { ShareData } from '@shared/components/sharesheet/sharesheet.component';
import { GroundBasicInfo } from '@shared/interfaces/ground.model';
import { ListOption } from '@shared/interfaces/others.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-view-ground-card',
  templateUrl: './view-ground-card.component.html',
  styleUrls: ['./view-ground-card.component.scss']
})
export class ViewGroundCardComponent implements OnInit {

  groundInfo: GroundBasicInfo;

  constructor(
    public dialogRef: MatDialogRef<ViewGroundCardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ListOption,
    private enlargeService: EnlargeService,
    private socialShareService: SocialShareService,
    private router: Router,
    private ngFire: AngularFirestore
  ) { }

  ngOnInit(): void {
    console.log(this.data)
    this.getGroundInfo();
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  getGroundInfo() {
    if (this.data.value) {
      this.ngFire.collection('grounds').doc(this.data.value).get()
        .pipe(
          map(resp => resp.exists ? resp.data() as GroundBasicInfo : null)
        )
        .subscribe({
          next: (response: GroundBasicInfo) => {
            if (response) {
              this.groundInfo = response;
            }
          }
        })
    }
  }

  onEnlargeImage() {
    this.enlargeService.onOpenPhoto(this.groundInfo.imgpath);
  }

  onNavigate() {
    this.router.navigate(['/ground', this.data.value])
    this.onCloseDialog();
  }

  onShare() {
    const data = new ShareData();
    data.share_url = `/ground/${this.data.value}`;
    this.socialShareService.onShare(data);
  }

}
