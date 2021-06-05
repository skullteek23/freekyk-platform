import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DashState } from 'src/app/dashboard/store/dash.reducer';
import { ContestService } from 'src/app/services/contest.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { myContestData } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-my-contest',
  templateUrl: './my-contest.component.html',
  styleUrls: ['./my-contest.component.css'],
})
export class MyContestComponent implements OnInit {
  isLoading: boolean = true;
  noContests: boolean = false;
  contests$: Observable<myContestData[]>;
  showForm$: Observable<boolean>;

  pendingSubmissions = [];
  ar = [1, 2, 3, 4, 5, 6, 7, 5];
  subm1 = false;
  subm3 = false;
  submissionLink: string = '';
  subm2 = false;
  currIndex: number = 0;
  noActiveContests: boolean;
  constructor(
    private snackServ: SnackbarService,
    private ngFire: AngularFirestore,
    private store: Store<DashState>,
    private contServ: ContestService
  ) {}
  ngOnInit(): void {
    this.getMyContests();
    this.showForm$ = this.contServ.onOpenForm;
  }

  getMyContests() {
    this.contests$ = this.contServ.fetchUserContests().pipe(
      tap((val) => {
        this.noContests = val.length == 0;
        this.isLoading = false;
      })
    );
  }
  onAddVideo(stage: number, contId: string) {
    this.contServ.setCid(contId);
    this.contServ.setCurrentStage(stage);
    this.contServ.onShowForm(true);
  }
  // addContestSubmission(subm: {}) {
  //   // backend code goes here
  //   // this.store
  //   //   .select('fsInfo')
  //   //   .pipe(take(1))
  //   //   .subscribe((data) => {
  //   //     const submission: ContestSubmission = {
  //   //       name: data.name,
  //   //       nickname: data.nickname,
  //   //       locCountry: data.locCountry,
  //   //       age: this.getAge(data.born),
  //   //       appr: 'W',
  //   //     };
  //   //     this.ngFire.collection('contests').doc('').collection('');
  //   //   });
  //   // this.ngFire.collection('');
  //   // this.snackServ.displayComplete();
  // }

  // onAddSubmission() {
  //   const newEntry = {
  //     submissionLink: this.submissionLink,
  //     stage: this.currIndex + 1,
  //   };
  //   if (this.currIndex == 0) {
  //     this.subm1 = true;
  //     this.currIndex++;
  //   } else if (this.currIndex == 1) {
  //     this.subm2 = true;
  //     this.currIndex++;
  //   } else if (this.currIndex == 2) this.subm3 = true;

  //   this.addContestSubmission(newEntry);
  //   this.submissionLink = '';
  // }
}
