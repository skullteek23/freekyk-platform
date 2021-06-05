import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TeamService } from 'src/app/services/team.service';
import { AppState } from 'src/app/store/app.reducer';

@Component({
  selector: 'app-da-te-gallery',
  templateUrl: './da-te-gallery.component.html',
  styleUrls: ['./da-te-gallery.component.css'],
})
export class DaTeGalleryComponent implements OnInit {
  noImages: boolean;
  galleryImages$: Observable<string[]>;
  constructor(private teServ: TeamService, store: Store<AppState>) {
    store
      .select('dash')
      .pipe(map((data) => data.hasTeam))
      .subscribe((data) => {
        this.noImages = data == null;
        if (data != null)
          this.galleryImages$ = this.teServ.getTeamGallery(data.id);
      });
  }
  ngOnInit(): void {}
  onOpenTeamSettings() {
    this.teServ.onOpenTeamSettingsDialog();
  }
}
