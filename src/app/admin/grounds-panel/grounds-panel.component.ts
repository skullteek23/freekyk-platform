import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  GroundBasicInfo,
  GroundMoreInfo,
} from 'src/app/shared/interfaces/ground.model';

import firebase from 'firebase/app';
@Component({
  selector: 'app-grounds-panel',
  templateUrl: './grounds-panel.component.html',
  styleUrls: ['./grounds-panel.component.css'],
})
export class GroundsPanelComponent implements OnInit {
  completed = false;
  groundIds: string[] = [];
  constructor(private ngFire: AngularFirestore) {}

  ngOnInit(): void {}
  onAddGrounds() {
    var batch1 = this.ngFire.firestore.batch();
    var batch2 = this.ngFire.firestore.batch();
    var grounds = this.getGrounds();
    var grMoreInfo = this.getMoreGroundInfo();
    for (let i = 0; i < grounds.length; i++) {
      var docRef = this.ngFire.firestore
        .collection('grounds')
        .doc(this.groundIds[i]);
      var docRef2 = this.ngFire.firestore
        .collection('grounds')
        .doc(this.groundIds[i])
        .collection('additionalInfo')
        .doc('moreInfo');
      batch1.set(docRef, grounds[i]);
      batch2.set(docRef2, grMoreInfo);
    }
    let allPromises = [];
    allPromises.push(
      new Promise((resolve, reject) => {
        resolve((this.completed = true));
      })
    );
    allPromises.push(batch1.commit().then(() => batch2.commit()));
    return Promise.all(allPromises);
  }
  getGrounds() {
    var grounds: GroundBasicInfo[] = [];
    for (let i = 0; i < 8; i++) {
      grounds.push(<GroundBasicInfo>{
        name: 'Football Ground ' + i,
        imgpath:
          i % 2 == 0
            ? 'https://images.unsplash.com/photo-1508166041112-5a0a8b70ecc5?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1936&q=80'
            : i % 3 == 0
            ? 'https://images.unsplash.com/photo-1466065665758-d473db752253?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1267&q=80'
            : 'https://images.unsplash.com/photo-1615417996592-615003487198?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80',
        locCity: 'Ghaziabad',
        locState: 'Uttar Pradesh',
        fieldType: 'FG',
        own_type: i % 2 == 0 ? 'PUBLIC' : i % 3 == 0 ? 'FK' : 'PRIVATE',
        playLvl: i % 2 == 0 ? 'fair' : i % 3 == 0 ? 'best' : 'good',
        id: this.getNewId(),
      });
    }
    return grounds;
  }
  getMoreGroundInfo() {
    return <GroundMoreInfo>{
      parking: true,
      mainten: false,
      goalp: true,
      opmTimeStart: firebase.firestore.Timestamp.fromDate(
        new Date(2021, 5, 5, 10)
      ),
      opmTimeEnd: firebase.firestore.Timestamp.fromDate(
        new Date(2021, 5, 5, 12)
      ),
      washroom: true,
      foodBev: false,
      avgRating: 4.5,
    };
  }

  getNewId() {
    const id = this.ngFire.createId();
    this.groundIds.push(id);
    return id;
  }
}
