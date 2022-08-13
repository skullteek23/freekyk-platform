import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { LOREM_IPSUM_SHORT } from 'src/app/shared/Constants/WEBSITE_CONTENT';
import {
  FsBasic,
  FsStats,
  FsProfileVideos,
  PlayerBasicInfo,
  PlayerMoreInfo,
  BasicStats,
} from 'src/app/shared/interfaces/user.model';

@Component({
  selector: 'app-players-panel',
  templateUrl: './players-panel.component.html',
  styleUrls: ['./players-panel.component.css'],
})
export class PlayersPanelComponent implements OnInit {
  completed = false;
  completed2 = false;
  playerIds: string[] = [];
  constructor(private ngFire: AngularFirestore) {}

  ngOnInit(): void {}
  onAddFsProfiles() {
    var allPromises = [];
    var profileBatchFs = this.ngFire.firestore.batch();
    var profileMoreBatchFs = this.ngFire.firestore.batch();
    var fsProfiles: FsBasic[] = this.getBasicInfoProfilesFs();
    var fsStats: FsStats = this.getFsStats();
    var fsVideos: any = this.getFsVideos();
    for (let k = 0; k < fsProfiles.length; k++) {
      var docRef = this.ngFire.firestore
        .collection('freestylers')
        .doc(this.playerIds[k]);
      var docRef2 = this.ngFire.firestore
        .collection('freestylers')
        .doc(this.playerIds[k])
        .collection('additionalInfo')
        .doc('statistics');
      var docRef3 = this.ngFire.firestore
        .collection('freestylers')
        .doc(this.playerIds[k])
        .collection('additionalInfo')
        .doc('fsVideos');
      profileBatchFs.set(docRef, fsProfiles[k]);
      profileMoreBatchFs.set(docRef2, fsStats);
      profileMoreBatchFs.set(docRef3, fsVideos);
    }
    allPromises.push(
      new Promise((resolve, reject) => {
        resolve((this.completed2 = true));
      })
    );
    allPromises.push(
      profileBatchFs.commit().then(() => profileMoreBatchFs.commit())
    );
    return Promise.all(allPromises);
  }
  onAddProfiles() {
    var allPromises = [];
    var profileBatch = this.ngFire.firestore.batch();
    var profileMoreBatch = this.ngFire.firestore.batch();
    var profiles: PlayerBasicInfo[] = this.getBasicInfoProfiles();
    var profilesAddi: PlayerMoreInfo[] = this.getMoreInfo();
    for (let i = 0; i < this.playerIds.length; i++) {
      var docRef = this.ngFire.firestore
        .collection('players')
        .doc(this.playerIds[i]);
      var docRef2 = this.ngFire.firestore
        .collection('players')
        .doc(this.playerIds[i])
        .collection('additionalInfo')
        .doc('statistics');
      var docRef3 = this.ngFire.firestore
        .collection('players')
        .doc(this.playerIds[i])
        .collection('additionalInfo')
        .doc('otherInfo');
      profileBatch.set(docRef, profiles[i]);
      profileMoreBatch.set(docRef2, this.getStats());
      profileMoreBatch.set(docRef3, profilesAddi[i]);
    }
    allPromises.push(
      new Promise((resolve, reject) => {
        resolve((this.completed = true));
      })
    );
    allPromises.push(
      profileBatch.commit().then(() => profileMoreBatch.commit())
    );
    return Promise.all(allPromises);
  }
  getStats() {
    return <BasicStats>{
      apps: 0,
      g: 0,
      w: 0,
      cards: 0,
      l: 0,
    };
  }
  getFsStats() {
    return <FsStats>{
      sk_lvl: 1,
      br_colb: [
        {
          name: 'Discord',
          imgpathLogo:
            'https://images.unsplash.com/photo-1614680376739-414d95ff43df?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1267&q=80',
        },
        {
          name: 'StarBucks',
          imgpathLogo:
            'https://images.unsplash.com/photo-1545231027-637d2f6210f8?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80',
        },
      ],
      tr_a: 0,
      tr_w: 0,
      tr_u: 0,
    };
  }
  getFsVideos() {
    return {
      vid_1: 'https://www.youtube.com/watch?v=K630UusINQY',
      vid_2: 'https://www.youtube.com/watch?v=K630UusINQY',
      vid_3: 'https://www.youtube.com/watch?v=K630UusINQY',
      vid_4: 'https://www.youtube.com/watch?v=K630UusINQY',
      vid_5: 'https://www.youtube.com/watch?v=K630UusINQY',
    };
  }
  getMoreInfo() {
    let basicMoreProfiles: PlayerMoreInfo[] = [];
    let basicNames: string[] = this.getPlayerNames();
    let basicPhotos: string[] = this.getPlayerPhotos();

    for (let j = 0; j < 14; j++) {
      basicMoreProfiles.push(<PlayerMoreInfo>{
        imgpath_lg: basicPhotos[j],
        profile: true,
        born: firebase.firestore.Timestamp.fromDate(new Date('25 May 1998')),
        gen: 'M',
        locState: 'Uttar Pradesh',
        locCountry: 'India',
        nickname: basicNames[j].slice(0, j + 5),
        height: 160 + j,
        weight: 50 + j,
        str_ft: j > 4 ? 'L' : 'R',
        bio: LOREM_IPSUM_SHORT,
        prof_teams: ['Real Madrid FC'],
        prof_tours: ['Champions League'],
      });
    }
    return basicMoreProfiles;
  }
  getBasicInfoProfilesFs() {
    let basicProfiles: FsBasic[] = [];
    let basicNames: string[] = this.getPlayerNames();
    let basicPhotos: string[] = this.getPlayerPhotos();
    for (let i = 0; i < 14; i++) {
      basicProfiles.push(<FsBasic>{
        name: basicNames[i],
        nickname: basicNames[i].slice(0, i + 5),
        gen: 'M',
        imgpath_lg: basicPhotos[i],
        born: firebase.firestore.Timestamp.fromDate(new Date('25 May 1998')),
        locCountry: 'India',
        bio: LOREM_IPSUM_SHORT,
        ig: 'https://www.instagram.com/manchesterunited/',
      });
    }

    return basicProfiles;
  }
  getBasicInfoProfiles() {
    let basicProfiles: PlayerBasicInfo[] = [];
    let basicNames: string[] = this.getPlayerNames();
    let basicPhotos: string[] = this.getPlayerPhotos();
    for (let i = 0; i < 7; i++) {
      basicProfiles.push(<PlayerBasicInfo>{
        name: basicNames[i],
        team: null,
        imgpath_sm: basicPhotos[i],
        jer_no: i > 4 ? i + 8 : i + 14,
        locCity: 'Ghaziabad',
        pl_pos: i < 3 ? 'Striker' : i < 5 ? 'Defender' : 'Center Midfielder',
        gen: 'M',
        id: this.getNewId(),
      });
    }
    for (let i = 0; i < 7; i++) {
      basicProfiles.push(<PlayerBasicInfo>{
        name: 'Player ' + (i + 1),
        team: {
          name: i > 2 ? 'Team A' : i < 6 ? 'Team B' : 'Team C',
          id: this.ngFire.createId(),
          capId: this.ngFire.createId(),
        },
        imgpath_sm: basicPhotos[i],
        jer_no: i > 4 ? i + 8 : i + 14,
        locCity: 'Ghaziabad',
        pl_pos: i > 3 ? 'Striker' : i < 6 ? 'Defender' : 'Center Midfielder',
        gen: 'M',
        id: this.getNewId(),
      });
    }
    return basicProfiles;
  }
  getNewId() {
    const id = this.ngFire.createId();
    this.playerIds.push(id);
    return id;
  }
  getPlayerNames() {
    return <string[]>[
      'Paras Jam',
      'Naman Pandey',
      'Oshu Ghul',
      'Sirhud Kalra',
      'Chinu Srivastav',
      'Vishal Tomar',
      'Shubham Kashyap',
      'Mintu Pandey',
      'Chintu Rohilla',
      'Dhruv Rathi',
      'Naveen parker',
      'Saleem Khan',
      'Utkarsh Gupta',
      'Prince Raj',
    ];
  }
  getPlayerPhotos() {
    return <string[]>[
      'https://images.unsplash.com/photo-1610673751396-84b4ba3978dd?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
      'https://images.unsplash.com/photo-1614594955631-e977926ea681?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=654&q=80',
      'https://images.unsplash.com/photo-1610043809095-9c87fe936e03?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80',
      'https://images.unsplash.com/photo-1615358630075-ba2bbe783521?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
      'https://images.unsplash.com/photo-1609966043644-17a7f591238c?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=687&q=80',
      'https://images.unsplash.com/photo-1615174640497-a267721b1cbe?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
      'https://images.unsplash.com/photo-1568585105565-e372998a195d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1615087574126-f4f3d62d73cf?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=637&q=80',
      'https://images.unsplash.com/photo-1614929239628-d76382324cff?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80',
      'https://images.unsplash.com/photo-1614916198414-5bc7470beb5e?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=637&q=80',
      'https://images.unsplash.com/photo-1610043809095-9c87fe936e03?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80',
      'https://images.unsplash.com/photo-1615358630075-ba2bbe783521?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
      'https://images.unsplash.com/photo-1609966043644-17a7f591238c?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=687&q=80',
      'https://images.unsplash.com/photo-1615174640497-a267721b1cbe?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
    ];
  }
}
