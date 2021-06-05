import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { EnlargeService } from 'src/app/services/enlarge.service';
import { SeasonMedia } from 'src/app/shared/interfaces/season.model';

@Component({
  selector: 'app-se-gallery',
  templateUrl: './se-gallery.component.html',
  styleUrls: ['./se-gallery.component.css'],
})
export class SeGalleryComponent implements OnInit {
  @Input() photos: string[] = [];
  watcher: Subscription;
  columns: any;
  photos$: Observable<SeasonMedia>;
  constructor(
    private mediaObs: MediaObserver,
    private enServ: EnlargeService,
    private ngFire: AngularFirestore
  ) {
    this.watcher = mediaObs
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
      });
  }
  ngOnInit(): void {}
  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
  onEnlargeView(imagePath: string) {
    this.enServ.onOpenPhoto(imagePath);
  }
}
