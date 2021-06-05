import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import firebase from 'firebase/app';
import { map } from 'rxjs/operators';
import { ContestBasicInfo } from 'src/app/shared/interfaces/contest.model';

@Component({
  selector: 'app-da-ho-all-contests',
  templateUrl: './da-ho-all-contests.component.html',
  styleUrls: ['./da-ho-all-contests.component.css'],
})
export class DaHoAllContestsComponent implements OnInit {
  isLoading = true;
  isLoadingContests = true;
  thisTime: firebase.firestore.Timestamp;
  noContest: boolean;
  contests: ContestBasicInfo[] = [];
  constructor(private ngfire: AngularFirestore, private router: Router) {
    this.thisTime = new firebase.firestore.Timestamp(
      new Date().getTime() / 1000,
      0
    );
    this.getUpcomingContests();
  }

  ngOnInit(): void {}
  onChangeIndex(changeState: MatTabChangeEvent) {
    this.isLoadingContests = true;
    this.noContest = false;
    this.contests = [];
    switch (changeState.index) {
      case 0:
        this.getUpcomingContests();
        break;
      case 1:
        this.getActiveContests();
        break;
      case 2:
        this.getFinishedContests();
        break;
      default:
        break;
    }
  }

  async getUpcomingContests() {
    let contSnap = await this.ngfire
      .collection('contests', (query) =>
        query.where('start_date', '>', this.thisTime).limit(6)
      )
      .get()
      .pipe(
        map((responseData) => {
          let newContests = [];
          responseData.forEach((element) => {
            let elementData = <ContestBasicInfo>element.data();
            newContests.push({ id: element.id, ...elementData });
          });
          return newContests;
        })
      )
      .toPromise();
    if (contSnap.length == 0) {
      this.noContest = true;
    } else {
      this.contests = contSnap;
    }
    this.isLoading = false;
    this.isLoadingContests = false;
  }
  async getActiveContests() {
    let contSnap = await this.ngfire
      .collection('contests', (query) =>
        query.where('end_date', '>', this.thisTime).limit(6)
      )
      .get()
      .pipe(
        map((responseData) => {
          let newContests: ContestBasicInfo[] = [];
          responseData.forEach((element) => {
            let elementData = <ContestBasicInfo>element.data();
            newContests.push({ id: element.id, ...elementData });
          });
          return newContests.filter(
            (con) =>
              con.end_date > this.thisTime && con.start_date < this.thisTime
          );
        })
      )
      .toPromise();
    if (contSnap.length == 0) {
      this.noContest = true;
    } else {
      this.contests = contSnap;
    }
    this.isLoading = false;
    this.isLoadingContests = false;
  }
  async getFinishedContests() {
    let contSnap = await this.ngfire
      .collection('contests', (query) =>
        query.where('end_date', '<', this.thisTime).limit(6)
      )
      .get()
      .pipe(
        map((responseData) => {
          let newContests = [];
          responseData.forEach((element) => {
            let elementData = <ContestBasicInfo>element.data();
            newContests.push({ id: element.id, ...elementData });
          });
          return newContests;
        })
      )
      .toPromise();
    if (contSnap.length == 0) {
      this.noContest = true;
    } else {
      this.contests = contSnap;
    }
    this.isLoading = false;
    this.isLoadingContests = false;
  }
}
