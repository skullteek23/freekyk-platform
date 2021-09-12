import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { SocialShareService } from '../services/social-share.service';
import { LOREM_IPSUM_SHORT } from '../shared/Constants/LOREM_IPSUM';
import { AcadBasicInfo } from '../shared/interfaces/academy.model';
import { ShareData } from '../shared/interfaces/others.model';

@Component({
  selector: 'app-academies',
  templateUrl: './academies.component.html',
  styleUrls: ['./academies.component.css'],
})
export class AcademiesComponent implements OnInit, OnDestroy {
  watcher: Subscription;
  columns: any;
  cardHeight: string = '';
  isLoading = true;
  noAcademies = false;
  academies$: Observable<AcadBasicInfo[]>;
  acFilter = ['Location'];
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
          this.cardHeight = '280px';
        } else if (change.mqAlias === 'sm') {
          this.columns = 2;
          this.cardHeight = '360px';
        } else if (change.mqAlias === 'md') {
          this.columns = 3;
          this.cardHeight = '320px';
        } else {
          this.columns = 4;
          this.cardHeight = '320px';
        }
      });
  }
  ngOnInit(): void {
    this.getAcademies();
  }
  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
  getAcademies() {
    this.academies$ = this.ngFire
      .collection('academies')
      .get()
      .pipe(
        tap((val) => {
          this.noAcademies = val.empty;
          this.isLoading = false;
        }),
        map((resp) => resp.docs.map((doc) => <AcadBasicInfo>doc.data()))
      );
  }
  onShare(acad: AcadBasicInfo) {
    const sData: ShareData = {
      share_desc: LOREM_IPSUM_SHORT,
      share_imgpath: acad.imgpath,
      share_title: acad.name,
      share_url:
        'https://freekyk8--h-qcd2k7n4.web.app/academies/academy' + acad.id,
    };
    this.shareServ.onShare(sData);
  }
}
