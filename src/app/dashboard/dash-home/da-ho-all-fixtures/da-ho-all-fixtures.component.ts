import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatTabGroup } from '@angular/material/tabs';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { MatchFixture, ParseMatchProperties } from '@shared/interfaces/match.model';
import { AppState } from 'src/app/store/app.reducer';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-da-ho-all-fixtures',
  templateUrl: './da-ho-all-fixtures.component.html',
  styleUrls: ['./da-ho-all-fixtures.component.scss'],
})
export class DaHoAllFixturesComponent implements OnInit, OnDestroy {

  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;

  isLoading = true;
  userMatches: MatchFixture[] = [];
  allFixtures: MatchFixture[] = [];
  allResults: MatchFixture[] = [];

  subscriptions = new Subscription();

  constructor(
    private ngFire: AngularFirestore,
    private store: Store<AppState>
  ) { }

  ngOnInit(): void {
    this.getMatches();
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  getMatches() {
    this.store.select('dash').pipe(map((resp) => (resp.hasTeam ? resp.hasTeam.name : null)))
      .subscribe(name => {
        if (name) {
          this.ngFire.collection('allMatches').get()
            .pipe(map(resp => resp.docs.map(doc => ({ id: doc.id, ...doc.data() as MatchFixture }))))
            .subscribe({
              next: (response: MatchFixture[]) => {
                console.log()
                this.userMatches = [];
                this.allFixtures = [];
                this.allResults = [];
                if (response) {
                  response.forEach(match => {
                    match.status = ParseMatchProperties.getTimeDrivenStatus(match.status, match.date);
                    if (!ParseMatchProperties.isResult(match.date)) {
                      this.allFixtures.push(match);
                    } else {
                      this.allResults.push(match);
                    }
                  });
                  this.userMatches = this.allFixtures.filter(fixture => fixture?.teams?.includes(name));
                }
                this.isLoading = false;
              },
              error: () => {
                this.isLoading = false;
                this.userMatches = [];
                this.allFixtures = [];
                this.allResults = [];
              }
            })
        }
      })

  }
}
