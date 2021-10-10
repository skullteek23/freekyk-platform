import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { AcadBasicInfo } from '../shared/interfaces/academy.model';

@Component({
  selector: 'app-academies',
  templateUrl: './academies.component.html',
  styleUrls: ['./academies.component.css'],
})
export class AcademiesComponent implements OnInit, OnDestroy {
  subscriptions = new Subscription();
  columns: any;
  cardHeight = '';
  isLoading = true;
  noAcademies = false;
  academies$: Observable<AcadBasicInfo[]>;
  acFilter = ['Location'];
  constructor(
    private mediaObs: MediaObserver,
    private ngFire: AngularFirestore
  ) {}
  ngOnInit(): void {
    this.subscriptions.add(
      this.mediaObs
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
        })
    );

    this.getAcademies();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  getAcademies(): void {
    this.academies$ = this.ngFire
      .collection('academies')
      .get()
      .pipe(
        tap((val) => {
          this.noAcademies = val.empty;
          this.isLoading = false;
        }),
        map((resp) => resp.docs.map((doc) => doc.data() as AcadBasicInfo))
      );
  }
  onShare(acad: AcadBasicInfo): void {}
}
