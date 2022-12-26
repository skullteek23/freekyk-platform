import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { EnlargeService } from 'src/app/services/enlarge.service';
import {
  Formatters,
  GroundBasicInfo,
  GroundMoreInfo,
} from '@shared/interfaces/ground.model';
import { ShareData, SocialShareService } from '@app/services/social-share.service';

@Component({
  selector: 'app-ground-profile',
  templateUrl: './ground-profile.component.html',
  styleUrls: ['./ground-profile.component.scss'],
})
export class GroundProfileComponent implements OnInit {

  groundInfo$: Observable<GroundBasicInfo>;
  groundMoreInfo$: Observable<GroundMoreInfo>;
  grName: string;
  grImgpath: string;
  grId: string;
  isLoading = true;
  formatter: any;
  error = false;
  groundID: string = '';

  constructor(
    private ngFire: AngularFirestore,
    private route: ActivatedRoute,
    private enlargeService: EnlargeService,
    private router: Router,
    private socialShareService: SocialShareService
  ) { }

  ngOnInit(): void {
    this.formatter = Formatters;
    this.groundID = this.route.snapshot.params.groundid;
    this.getGroundInfo();
  }

  getGroundInfo(): void {
    if (!this.groundID) {
      return;
    }
    this.groundInfo$ = this.ngFire
      .collection('grounds')
      .doc(this.groundID)
      .get()
      .pipe(
        tap((resp) => {
          if (resp.exists) {
            this.getGroundMoreInfo(this.groundID);
            this.grName = (resp.data() as GroundBasicInfo).name;
            this.grImgpath = (resp.data() as GroundBasicInfo).imgpath;
            this.grId = this.groundID;
          } else {
            this.error = !resp.exists;
            this.router.navigate(['error']);
          }
        }),
        map((resp) => resp?.data() as GroundBasicInfo),
        share()
      );
  }

  getGroundMoreInfo(gid: string): void {
    this.groundMoreInfo$ = this.ngFire
      .collection('groundDetails')
      .doc(gid)
      .get()
      .pipe(
        tap(() => (this.isLoading = false)),
        map((resp) => resp.data() as GroundMoreInfo),
        share()
      );
  }

  onEnlargePhoto(): void {
    this.enlargeService.onOpenPhoto(this.grImgpath);
  }

  onShare() {
    const data = new ShareData();
    data.share_url = `/ground/${this.groundID}`;
    this.socialShareService.onShare(data);
  }
}
