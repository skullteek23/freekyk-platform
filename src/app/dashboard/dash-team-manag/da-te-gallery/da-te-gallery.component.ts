import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { TeamService } from 'src/app/services/team.service';
import { AppState } from 'src/app/store/app.reducer';

@Component({
  selector: 'app-da-te-gallery',
  templateUrl: './da-te-gallery.component.html',
  styleUrls: ['./da-te-gallery.component.css'],
})
export class DaTeGalleryComponent implements OnInit, OnDestroy {
  noImages: boolean;
  galleryImages$: Observable<string[]>;
  subscriptions = new Subscription();
  constructor(private teServ: TeamService, private store: Store<AppState>) {}
  ngOnInit(): void {
    this.subscriptions.add(
      this.store
        .select('dash')
        .pipe(map((data) => data.hasTeam))
        .subscribe((data) => {
          this.noImages = data === null;
          if (data) {
            this.galleryImages$ = this.teServ.getTeamGallery(data.id);
          }
        })
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  onOpenTeamSettings(): void {
    this.teServ.onOpenTeamSettingsDialog();
  }
}
