import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { EnlargeService } from 'src/app/services/enlarge.service';
import { SocialShareService } from 'src/app/services/social-share.service';
import { LOREM_IPSUM_SHORT } from 'src/app/shared/Constants/LOREM_IPSUM';
import {
  GroundBasicInfo,
  GroundMoreInfo,
} from 'src/app/shared/interfaces/ground.model';
import { ShareData } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-ground-profile',
  templateUrl: './ground-profile.component.html',
  styleUrls: ['./ground-profile.component.css'],
})
export class GroundProfileComponent implements OnInit {
  groundInfo$: Observable<GroundBasicInfo>;
  groundMoreInfo$: Observable<GroundMoreInfo>;
  grName: string;
  grImgpath: string;
  grId: string;
  isLoading: boolean = true;
  error: boolean = false;
  constructor(
    private ngFire: AngularFirestore,
    private route: ActivatedRoute,
    private shareServ: SocialShareService,
    private enlServ: EnlargeService,
    private router: Router
  ) {
    const GroundId = route.snapshot.params['groundid'];
    this.getGroundInfo(GroundId);
  }
  ngOnInit(): void {}
  getGroundInfo(gid: string) {
    this.groundInfo$ = this.ngFire
      .collection('grounds')
      .doc(gid)
      .get()
      .pipe(
        tap((resp) => {
          if (resp.exists) {
            this.getGroundMoreInfo(gid);
            this.grName = (<GroundBasicInfo>resp.data()).name;
            this.grImgpath = (<GroundBasicInfo>resp.data()).imgpath;
            this.grId = gid;
          } else {
            this.error = !resp.exists;
            this.router.navigate(['error']);
          }
        }),
        map((resp) => <GroundBasicInfo>resp?.data()),
        share()
      );
  }
  getGroundMoreInfo(gid: string) {
    this.groundMoreInfo$ = this.ngFire
      .collection('grounds/' + gid + '/additionalInfo')
      .doc('moreInfo')
      .get()
      .pipe(
        tap((resp) => (this.isLoading = false)),
        map((resp) => <GroundMoreInfo>resp.data()),
        share()
      );
  }
  getFieldType(type: 'FG' | 'SG' | 'HG' | 'AG' | 'TURF') {
    switch (type) {
      case 'FG':
        return 'Full Ground';
      case 'SG':
        return 'Short Ground';
      case 'HG':
        return 'Huge Ground';
      case 'AG':
        'Agile Ground';
      case 'TURF':
        return 'Football Turf';

      default:
        return 'Not Available';
    }
  }
  onShare() {
    const shareData: ShareData = {
      share_desc: LOREM_IPSUM_SHORT,
      share_imgpath: this.grImgpath,
      share_title: this.grName,
      share_url: 'https://freekyk8--h-qcd2k7n4.web.app/ground/' + this.grId,
    };
    this.shareServ.onShare(shareData);
  }
  onSubmitGroundRating() {
    // this.ngFire.collection('grounds').doc();
  }
  onEnlargePhoto() {
    this.enlServ.onOpenPhoto(this.grImgpath);
  }
}
