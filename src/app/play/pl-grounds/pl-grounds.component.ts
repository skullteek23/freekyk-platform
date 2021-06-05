import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { SocialShareService } from 'src/app/services/social-share.service';
import { LOREM_IPSUM_SHORT } from 'src/app/shared/Constants/CONSTANTS';
import { GroundBasicInfo } from 'src/app/shared/interfaces/ground.model';
import { ShareData } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-pl-grounds',
  templateUrl: './pl-grounds.component.html',
  styleUrls: ['./pl-grounds.component.css'],
})
export class PlGroundsComponent implements OnInit, OnDestroy {
  watcher: Subscription;
  columns: any;
  cardHeight: string = '';
  isLoading = true;
  noGrounds = false;
  grounds$: Observable<GroundBasicInfo[]>;
  groundsFilters = ['Location', 'Owner', 'Field Type'];
  constructor(
    private mediaObs: MediaObserver,
    private ngFire: AngularFirestore,
    private shareServ: SocialShareService
  ) {
    this.watcher = this.mediaObs
      .asObservable()
      .pipe(
        filter((changes: MediaChange[]) => changes.length > 0),
        map((changes: MediaChange[]) => changes[0])
      )
      .subscribe((change: MediaChange) => {
        if (change.mqAlias === 'xs') {
          this.columns = 1;
        } else if (change.mqAlias === 'sm') {
          this.columns = 2;
        } else if (change.mqAlias === 'md') {
          this.columns = 3;
        } else {
          this.columns = 4;
        }
      });
  }

  ngOnInit(): void {
    this.getGrounds();
  }
  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
  getGrounds() {
    this.grounds$ = this.ngFire
      .collection('grounds')
      .get()
      .pipe(
        tap((val) => {
          this.noGrounds = val.empty;
          this.isLoading = false;
        }),
        map((resp) =>
          resp.docs.map(
            (doc) =>
              <GroundBasicInfo>{ id: doc.id, ...(<GroundBasicInfo>doc.data()) }
          )
        )
      );
  }
  onShare(gr: GroundBasicInfo) {
    const shareData: ShareData = {
      share_title: gr.name,
      share_desc: LOREM_IPSUM_SHORT,
      share_imgpath: gr.imgpath,
      share_url: 'https://freekyk8--h-qcd2k7n4.web.app/ground/' + gr.id,
    };
    this.shareServ.onShare(shareData);
  }
}
