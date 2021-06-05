import { Component, OnDestroy, OnInit } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { EnlargeService } from 'src/app/services/enlarge.service';

@Component({
  selector: 'app-ac-gallery',
  templateUrl: './ac-gallery.component.html',
  styleUrls: ['./ac-gallery.component.css'],
})
export class AcGalleryComponent implements OnInit, OnDestroy {
  watcher: Subscription;
  columns: any;
  constructor(
    private mediaObs: MediaObserver,
    private enlServ: EnlargeService
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
    this.enlServ.onOpenPhoto(imagePath);
  }
}
