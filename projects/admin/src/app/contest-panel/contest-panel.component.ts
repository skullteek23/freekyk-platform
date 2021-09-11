import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  ContestBasicInfo,
  ContestDescription,
} from 'src/app/shared/interfaces/contest.model';
import firebase from 'firebase/app';
import {
  LOREM_IPSUM_LONG,
  LOREM_IPSUM_MEDIUM,
} from 'src/app/shared/Constants/CONSTANTS';

@Component({
  selector: 'app-contest-panel',
  templateUrl: './contest-panel.component.html',
  styleUrls: ['./contest-panel.component.css'],
})
export class ContestPanelComponent implements OnInit {
  completed = false;
  contIds: string[] = [];
  constructor(private ngFire: AngularFirestore) {}

  ngOnInit(): void {}
  onAddContests() {
    var batch = this.ngFire.firestore.batch();
    var batch2 = this.ngFire.firestore.batch();
    var contestBasicInfo = this.getBasicContests();
    var contestMoreInfo = this.getMoreContInfo();
    for (let i = 0; i < contestBasicInfo.length; i++) {
      var docRef = this.ngFire.firestore
        .collection('contests')
        .doc(this.contIds[i]);
      var docRef2 = this.ngFire.firestore
        .collection('contests')
        .doc(this.contIds[i])
        .collection('additionalInfo')
        .doc('moreInfo');
      batch.set(docRef, contestBasicInfo[i]);
      batch2.set(docRef2, contestMoreInfo);
    }
    let allPromises = [];
    allPromises.push(
      new Promise((resolve, reject) => {
        resolve((this.completed = true));
      })
    );
    allPromises.push(batch.commit().then(() => batch2.commit()));
    return Promise.all(allPromises);
  }
  getBasicContests() {
    let contestInfo: ContestBasicInfo[] = [];
    for (let i = 0; i < 9; i++) {
      contestInfo.push(<ContestBasicInfo>{
        id: this.getNewId(),
        imgpath:
          'https://images.unsplash.com/photo-1615731439720-47878ecc1ac6?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80',
        name: 'Freekyk Freestyle Contest ' + i,
        start_date: firebase.firestore.Timestamp.fromDate(
          new Date('18 June 2021')
        ),
        end_date: firebase.firestore.Timestamp.fromDate(
          new Date('18 July 2021')
        ),
        fees: 200 + 300 * i,
      });
    }
    return contestInfo;
  }
  getMoreContInfo() {
    return <ContestDescription>{
      rules: LOREM_IPSUM_LONG,
      prizes: {
        first: 'Nike Ball',
        second: 'Adidas Ball',
        third: 'Cash Prize Worth Rs.500',
      },
      brands: [
        {
          name: 'Freekyk',
          imgpath:
            'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80',
        },
        {
          name: 'StarBucks',
          imgpath:
            'https://images.unsplash.com/photo-1545231027-637d2f6210f8?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80',
        },
      ],
      scoreCnt: LOREM_IPSUM_MEDIUM,
    };
  }
  getNewId() {
    const id = this.ngFire.createId();
    this.contIds.push(id);
    return id;
  }
  onOpenContestForm() {}
}
