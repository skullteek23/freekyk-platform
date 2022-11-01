import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { EnlargeService } from 'src/app/services/enlarge.service';
import { SeasonMedia } from '@shared/interfaces/season.model';

@Component({
  selector: 'app-se-gallery',
  templateUrl: './se-gallery.component.html',
  styleUrls: ['./se-gallery.component.css'],
})
export class SeGalleryComponent implements OnInit, OnDestroy {
  @Input() photos: string[] = [];
  subscriptions = new Subscription();
  columns: any;
  photos$: Observable<SeasonMedia>;
  constructor(
    private mediaObs: MediaObserver,
    private enServ: EnlargeService,
    private ngFire: AngularFirestore
  ) { }
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
          } else if (change.mqAlias === 'sm') {
            this.columns = 2;
          } else {
            this.columns = 3;
          }
        })
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  onEnlargeView(imagePath: string): void {
    this.enServ.onOpenPhoto(imagePath);
  }
}
