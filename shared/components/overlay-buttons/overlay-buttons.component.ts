import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LiveSeasonComponent } from '@app/shared/dialogs/live-season/live-season.component';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import { ApiService } from '@shared/services/api.service';

@Component({
  selector: 'app-overlay-buttons',
  templateUrl: './overlay-buttons.component.html',
  styleUrls: ['./overlay-buttons.component.scss']
})
export class OverlayButtonsComponent implements OnInit {

  seasonsList: SeasonBasicInfo[] = [];

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.getLiveSeasons();
  }

  getLiveSeasons() {
    this.apiService.getLiveSeasons()
      .subscribe({
        next: (response) => {
          this.seasonsList = response;
        },
        error: () => {
          this.seasonsList = [];
        }
      });
  }

  openLiveSeason(data: SeasonBasicInfo) {
    this.dialog.open(LiveSeasonComponent, {
      panelClass: 'fk-dialogs',
      data
    });
  }

}
