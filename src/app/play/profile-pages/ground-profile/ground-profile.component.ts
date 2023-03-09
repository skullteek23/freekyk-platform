import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { EnlargeService } from 'src/app/services/enlarge.service';
import {
  Formatters,
  GroundBasicInfo,
  GroundMoreInfo,
} from '@shared/interfaces/ground.model';
import { SocialShareService } from '@app/services/social-share.service';
import { ShareData } from '@shared/components/sharesheet/sharesheet.component';
import { SubmitMatchRequestComponent } from '@app/shared/dialogs/submit-match-request/submit-match-request.component';
import { MatDialog } from '@angular/material/dialog';
import { GroundAllInfo } from '@shared/utils/pipe-functions';
import { ApiService } from '@shared/services/api.service';
import { IStatisticsCard } from '@app/dashboard/dash-home/my-stats-card/my-stats-card.component';

@Component({
  selector: 'app-ground-profile',
  templateUrl: './ground-profile.component.html',
  styleUrls: ['./ground-profile.component.scss'],
})
export class GroundProfileComponent implements OnInit, OnDestroy {

  // groundInfo$: Observable<GroundBasicInfo>;
  // groundMoreInfo$: Observable<GroundMoreInfo>;
  // grName: string;
  // grImgpath: string;
  // grId: string;
  // isLoading = true;
  // formatter: any;
  // error = false;
  // groundID: string = '';

  ground: Partial<GroundAllInfo> = null;
  formatter: any;
  subscriptions = new Subscription();
  groundID = null;
  isLoaderShown = false;
  groundFacilities: IStatisticsCard[] = [];


  constructor(
    private route: ActivatedRoute,
    private enlargeService: EnlargeService,
    private router: Router,
    private socialShareService: SocialShareService,
    private dialog: MatDialog,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.formatter = Formatters;
    this.subscriptions.add(this.route.params.subscribe({
      next: (params) => {
        if (params && params.hasOwnProperty('groundid')) {
          this.groundID = params['groundid'];
          this.getGroundInfo();
        }
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getGroundInfo(): void {
    if (this.groundID) {
      this.isLoaderShown = true;
      this.apiService.getGroundAllInfo(this.groundID)
        .subscribe({
          next: (response) => {
            if (response) {
              this.ground = response;
              this.createGroundFacilitiesData();
            }
            window.scrollTo(0, 0);
            this.isLoaderShown = false;
          },
          error: () => {
            this.ground = null;
            window.scrollTo(0, 0);
            this.isLoaderShown = false;
            this.router.navigate(['/error'])
          },
        })
    }
  }

  createGroundFacilitiesData() {
    this.groundFacilities = [];
    this.groundFacilities.push({ icon: this.getIcon('goalpost'), label: 'Goal post', value: '', iconClass: this.getIconClass('goalpost') });
    this.groundFacilities.push({ icon: this.getIcon('referee'), label: 'Referee', value: '', iconClass: this.getIconClass('referee') });
    this.groundFacilities.push({ icon: this.getIcon('parking'), label: 'Parking', value: '', iconClass: this.getIconClass('parking') });
    this.groundFacilities.push({ icon: this.getIcon('washroom'), label: 'Washroom', value: '', iconClass: this.getIconClass('washroom') });
    this.groundFacilities.push({ icon: this.getIcon('staff'), label: 'Staff', value: '', iconClass: this.getIconClass('staff') });
    this.groundFacilities.push({ icon: this.getIcon('foodBev'), label: 'Food & Bev.', value: '', iconClass: this.getIconClass('foodBev') });
  }

  getIcon(key: string): string {
    if (this.ground?.hasOwnProperty(key)) {
      return this.ground[key] === true ? 'check' : 'clear';
    }
  }

  getIconClass(key: string): string {
    if (this.ground?.hasOwnProperty(key)) {
      return this.ground[key] === true ? 'filled' : 'red';
    }
  }

  enlargePhoto(): void {
    if (this.ground?.imgpath) {
      this.enlargeService.onOpenPhoto(this.ground.imgpath);
    }
  }

  requestMatch() {
    this.dialog.open(SubmitMatchRequestComponent, {
      panelClass: 'fk-dialogs'
    });
  }

  share() {
    const data = new ShareData();
    data.share_url = `/ground/${this.ground.id}`;
    this.socialShareService.onShare(data);
  }
}
