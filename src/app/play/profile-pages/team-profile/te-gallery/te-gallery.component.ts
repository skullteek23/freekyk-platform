import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { EnlargeService } from 'src/app/services/enlarge.service';
import { TeamMedia } from 'src/app/shared/interfaces/team.model';

@Component({
  selector: 'app-te-gallery',
  templateUrl: './te-gallery.component.html',
  styleUrls: ['./te-gallery.component.css'],
})
export class TeGalleryComponent implements OnInit {
  @Input() photos: string[] = [];
  watcher: Subscription;
  columns: any;
  photos$: Observable<TeamMedia>;
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
