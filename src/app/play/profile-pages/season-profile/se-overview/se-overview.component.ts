import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import {
  SeasonAbout,
  SeasonParticipants,
} from '@shared/interfaces/season.model';

@Component({
  selector: 'app-se-overview',
  templateUrl: './se-overview.component.html',
  styleUrls: ['./se-overview.component.css'],
})
export class SeOverviewComponent implements OnInit {
  @Input() data: SeasonAbout;
  @Input() set seasonId(value) {
    if (value) {
      this.getSeasonParticipants(value);
    }
  }
  @Input() venue: { city: string; state: string };
  participants$: Observable<SeasonParticipants[]>;
  constructor(private ngFire: AngularFirestore) { }
  ngOnInit(): void { }
  getSeasonParticipants(sid: string): void {
    this.participants$ = this.ngFire
      .collection(`seasons/${sid}/participants`)
      .get()
      .pipe(
        map((resp) => resp.docs.map((doc) => doc.data() as SeasonParticipants)),
        share()
      );
  }
}
