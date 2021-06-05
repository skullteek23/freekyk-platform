import { Component, OnInit } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-video-editing',
  templateUrl: './video-editing.component.html',
  styleUrls: ['./video-editing.component.css'],
})
export class VideoEditingComponent implements OnInit {
  watcher: Subscription;
  onMobile: boolean = false;
  columns: number = 1;
  videos: number[] = [1, 1, 1, 1];
  apiLoaded = false;

  constructor(private mediaObs: MediaObserver) {
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
        } else if (change.mqAlias === 'md') {
          this.columns = 3;
        } else {
          this.columns = 4;
        }
      });
  }
  ngOnInit() {}
  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
}
