import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatchFixture } from '@shared/interfaces/match.model';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-se-fixtures',
  templateUrl: './se-fixtures.component.html',
  styleUrls: ['./se-fixtures.component.scss']
})
export class SeFixturesComponent implements OnInit {

  @Input() showResults = false;
  @Input() set seasonName(value: string) {
    this.getMatches(value);
  }

  matches$: Observable<MatchFixture[]>;
  noMatches = false;

  constructor(private ngFire: AngularFirestore) { }

  ngOnInit(): void {
  }

  getMatches(season: string) {
    const concluded: boolean = this.showResults ? true : false;
    if (season) {
      this.matches$ = this.ngFire.collection('allMatches', query => query.where('concluded', '==', concluded).where('season', '==', season))
        .valueChanges()
        .pipe(
          map(resp => resp as MatchFixture[]),
          tap(resp => this.noMatches = !resp || !resp.length ? true : false)
        )

    }
  }
}
