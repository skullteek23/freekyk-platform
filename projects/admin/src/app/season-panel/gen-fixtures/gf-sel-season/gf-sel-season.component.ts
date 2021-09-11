import { Component, OnInit, Output } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Observable, Subject } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { tempTour } from 'src/app/shared/interfaces/others.model';
import { SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';
import { GenFixtService } from '../gen-fixt.service';

@Component({
  selector: 'app-gf-sel-season',
  templateUrl: './gf-sel-season.component.html',
  styleUrls: ['./gf-sel-season.component.css'],
})
export class GfSelSeasonComponent implements OnInit {
  existingSeasons$: Observable<SeasonBasicInfo[]>;
  sCount$: Observable<number>;
  selected: number = 0;
  seasonInfo: FormGroup;
  season: SeasonBasicInfo = null;
  pCount: number = 0;
  constructor(
    private ngFire: AngularFirestore,
    private genServ: GenFixtService
  ) {}
  ngOnInit(): void {
    this.getSeasons();
    this.seasonInfo = new FormGroup({
      season: new FormControl(null, Validators.required),
      startDate: new FormControl(null, Validators.required),
      perTeamPlaying: new FormControl(null, Validators.required),
    });
  }
  getSeasons() {
    this.existingSeasons$ = this.ngFire
      .collection('seasons')
      .get()
      .pipe(
        map((resp) =>
          resp.docs.map(
            (doc) =>
              <SeasonBasicInfo>{ id: doc.id, ...(<SeasonBasicInfo>doc.data()) }
          )
        )
      );
  }
  onSelectSeason(event: MatSelectChange) {
    this.sCount$ = this.ngFire
      .collection('seasons')
      .doc(event.value.id)
      .collection('participants')
      .get()
      .pipe(
        tap((resp) => (this.pCount = resp.docs.length)),
        tap((resp) => {
          this.genServ.onSelectSeason(event.value);
        }),
        map((resp) => resp.docs.length)
      );
  }
  onSubmit() {
    this.genServ.addTourData(<tempTour>{
      participantCount: this.pCount,
      perTeamPlaying: this.seasonInfo.value['perTeamPlaying'],
      tour_type: this.getTour(this.selected),
      startDate: this.seasonInfo.value['startDate'],
    });
    this.genServ.onNextStep();
  }
  getTour(sel: number): 'FKC' | 'FCP' | 'FPL' {
    return sel == 0 ? 'FCP' : sel == 1 ? 'FKC' : 'FPL';
  }
}
