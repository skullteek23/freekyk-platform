import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { randAvatar, randBetweenDate, randCity, randCountry, randNumber, randSentence, randState, randWord } from '@ngneat/falso';
import { CLOUD_FUNCTIONS } from '../shared/Constants/CLOUD_FUNCTIONS';
import { PlayerMoreInfo } from '../shared/interfaces/user.model';
import { PLAYING_POSTIIONS, DUMMY_USERS, GENDER, STRONG_FOOT } from '../dummyUsers.constants';
import firebase from 'firebase/app';
@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  readonly STRONG_FOOT: string[] = STRONG_FOOT;
  readonly GENDER: string[] = GENDER;
  readonly MOCK_IDS = 'mock-uids';
  readonly PLAYING_POSITIONS: string[] = PLAYING_POSTIIONS;
  readonly USERS: any[] = DUMMY_USERS;

  constructor(
    private ngAuth: AngularFireAuth,
    private ngFire: AngularFirestore,
    private ngFunc: AngularFireFunctions
  ) {
    // this.initFirebaseAuth();
    // this.initFirestore();

    // this.startFromAuth();
    // this.startFromMoreInfo();
    // const teamInfo = {
    //   capId: "qHoWkwF6RHTkC8U9JWMvgeWyk7Z2",
    //   id: "gOZ5yL2RkRmGqP94EDQK",
    //   name: "SkullKickers FC"
    // }
    // const teamMembersArray: Tmember[] = [
    //   {
    //     name: 'Prateek goel',
    //     id: 'qHoWkwF6RHTkC8U9JWMvgeWyk7Z2',
    //     pl_pos: 'Left Winger',
    //     imgpath_sm: 'https://storage.googleapis.com/freekyk-development.appspot.com/thumb_qHoWkwF6RHTkC8U9JWMvgeWyk7Z2?GoogleAccessId=freekyk-development%40appspot.gserviceaccount.com&Expires=7258032000&Signature=k1n2VCq6iolXzohMSPlVaE1RR264QJ0jF7kYF6cBr2YgbB43ocL%2FDXa4mYSg1vAatlLKQag2%2FPNKPd9M3GpbsQUIsSBM2zDG43h%2FdexKihHl%2FYJIe5DG8c58LWC5pa9Ug2OHaIIzPPepnaRCdOkfbC%2B2fJ2FCA1c1qX70Y1K6Zer0e1uwj%2F6%2F7%2BvcfzFxNyG%2BwN2ldC75w63mE5F64v0rJQcHno4ZdgXXJL1PQzTRa9064IwSIUVIOaQkD21%2Br%2F3h2tVj5QrEBWorDfL3IBb7VMboSzpzmqacG4vzPkUqPlYxHjjjZrGktmjjBSzRpJoO2iz73Rbo6Y%2FzlmhUsQ5jw%3D%3D',
    //   },
    //   {
    //     name: 'et quaerat',
    //     id: '21bTnNXmrLZxrxgeIS67L8tBvN63',
    //     pl_pos: 'Left Winger',
    //     imgpath_sm: 'https://i.pravatar.cc/100',
    //   },
    //   {
    //     name: 'in in',
    //     id: '2x4d8vmYgtcHYZACoplishCIpYp2',
    //     pl_pos: 'Striker',
    //     imgpath_sm: 'https://i.pravatar.cc/100',
    //   },
    //   {
    //     name: 'in quae',
    //     id: '6oNcBrRm7EMIYjzpRohyR5jm1nn1',
    //     pl_pos: 'Center Forward',
    //     imgpath_sm: 'https://i.pravatar.cc/100',
    //   },
    //   {
    //     name: 'quas at',
    //     id: 'DJC2wLYNfpeU19uTWY5AfMta9Qw2',
    //     pl_pos: 'Center Forward',
    //     imgpath_sm: 'https://i.pravatar.cc/100',
    //   },
    //   {
    //     name: 'in repellat',
    //     id: 'NcBQzjoeaOgWa7ThVYSt1ZPmuv23',
    //     pl_pos: 'Left Midfielder',
    //     imgpath_sm: 'https://i.pravatar.cc/100',
    //   },
    //   {
    //     name: 'facilis excepturi',
    //     id: 'R3PbkjVFtQNn5SMAk1ABodPFVsV2',
    //     pl_pos: 'Left Midfielder',
    //     imgpath_sm: 'https://i.pravatar.cc/100',
    //   },
    //   {
    //     name: 'sapiente ducimus',
    //     id: 'dUeADtf8RnY1KeoHpic7UgiuLJE3',
    //     pl_pos: 'Left Midfielder',
    //     imgpath_sm: 'https://i.pravatar.cc/100',
    //   },
    // ]
    // this.startFromTeams(teamInfo);
    // this.updateTeamMembers(teamMembersArray, 'gOZ5yL2RkRmGqP94EDQK');
  }

  private initFirebaseAuth(): any {
    const slicedUsers = this.USERS.slice(0, 10);
    // const slicedUsers = this.USERS.slice(10, 20);
    // const slicedUsers = this.USERS.slice(20, 30);
    // const slicedUsers = this.USERS.slice(30, 40);
    // const slicedUsers = this.USERS.slice(40, 50);
    // const slicedUsers = this.USERS.slice(50, 60);
    // const slicedUsers = this.USERS.slice(60, 70);
    // const slicedUsers = this.USERS.slice(70, 80);
    // const slicedUsers = this.USERS.slice(80, 90);
    // const slicedUsers = this.USERS.slice(90);
    slicedUsers.forEach(user => {
      this.addUser(user.email, user.password, user.name);
    })
  }

  private initFirestore(): any {
    this.USERS.forEach(user => {
      const userDetails = {
        nickname: user.nickname
      };
      setTimeout(() => {
        this.addUserInfo(user.uid, userDetails);
      }, 2000);
    })
  }

  private addUser(email: string, pass: string, name: string): any {
    return this.ngAuth
      .createUserWithEmailAndPassword(email, pass)
      .then((userData) => {
        // saving mock UIDs
        let mockIds: any[] = [];
        mockIds = JSON.parse(localStorage.getItem(this.MOCK_IDS)) as any[];
        if (!mockIds) {
          mockIds = [];
        }
        mockIds.push(userData.user.uid);
        localStorage.setItem(this.MOCK_IDS, JSON.stringify(mockIds));
        // saving mock UIDs

        // generating mock profiles via cloud function
        const callable = this.ngFunc.httpsCallable(
          CLOUD_FUNCTIONS.CREATE_PROFILE
        );
        return callable({ name, uid: userData.user.uid }).toPromise();
        // generating mock profiles via cloud function
      });
  }

  private addUserInfo(uid: string, userDetails: any): any {
    const allPromises: any[] = [];
    const newDetails: PlayerMoreInfo = {
      imgpath_lg: randAvatar(),
      profile: true,
      born: firebase.firestore.Timestamp.fromDate(randBetweenDate({ from: new Date('01/01/1968'), to: new Date('01/01/2003') })),
      locState: randState(),
      locCountry: randCountry(),
      nickname: userDetails.nickname,
      height: randNumber({ min: 100, max: 250 }),
      weight: randNumber({ min: 20, max: 150 }),
      str_ft: this.getRandomSelectionFromArray(this.STRONG_FOOT) as 'L' | 'R',
      bio: randSentence(),
      prof_teams: [
        `${randWord()} FC`,
        `${randWord()} FC`,
        `${randWord()} FC`,
      ],
      prof_tours: [
        `${randWord()} Championship`,
        `${randWord()} Tournament`,
        `${randWord()} Competition`,
      ],
    };
    const newBasicDetails = {
      gen: 'M',
      imgpath_sm: newDetails.imgpath_lg,
      jer_no: randNumber({ min: 2, max: 40 }),
      locCity: randCity(),
      pl_pos: this.getRandomSelectionFromArray(this.PLAYING_POSITIONS),
    };
    allPromises.push(this.ngFire.collection(`players/${uid}/additionalInfo`).doc('otherInfo').set(newDetails));
    allPromises.push(this.ngFire.collection('players').doc(uid).update({
      ...newBasicDetails,
    }));
    return Promise.all(allPromises);
  }

  // private updateUserStatsInFirestore(uid: string): any {
  //   const newPlayerStats: BasicStats = {
  //     apps: 0,
  //     g: 0,
  //     w: 0,
  //     cards: 0,
  //     l: 0,
  //   };
  //   const newFsStats: FsStats = {
  //     sk_lvl: 0,
  //     br_colb: [],
  //     top_vids: [],
  //     tr_a: 0,
  //     tr_w: 0,
  //     tr_u: 0,
  //   };
  //   const twoPromises: any[] = [];
  //   twoPromises.push(
  //     this.ngFire
  //       .collection(`players/${uid}/additionalInfo`)
  //       .doc('statistics')
  //       .set(newPlayerStats)
  //   );
  //   twoPromises.push(
  //     this.ngFire
  //       .collection(`freestylers/${uid}/additionalInfoFs`)
  //       .doc('statistics')
  //       .set(newFsStats)
  //   );
  //   return Promise.all(twoPromises);
  // }

  // private updateUserTeamStatus(uid: string, teamInfo): any {
  //   const team = teamInfo;
  //   return this.ngFire.collection('players').doc(uid).update({
  //     team
  //   })
  // }

  // private updateTeamMembers(value: Tmember[], tid: string) {
  //   return this.ngFire.collection(`teams/${tid}/additionalInfo`).doc('members').update({ members: value });
  // }

  // private startFromMoreInfo(): any {
  //   const mockIds = JSON.parse(localStorage.getItem(this.MOCK_IDS)) as any[];
  //   if (!mockIds) {
  //     return;
  //   }
  //   for (let i = 0; i < mockIds.length; i++) {
  //     setTimeout(() => {
  //       this.addUserAdditionalInfoInFirestore(mockIds[i]);
  //     }, i * 250);
  //   }
  // }

  // private startFromTeams(teamInfo): any {
  //   const mockIds = JSON.parse(localStorage.getItem(this.MOCK_IDS)) as any[];
  //   if (!mockIds) {
  //     return;
  //   }
  //   for (let i = 0; i < mockIds.length; i++) {
  //     setTimeout(() => {
  //       this.updateUserTeamStatus(mockIds[i], teamInfo);
  //     }, i * 250);
  //   }
  // }

  private getRandomSelectionFromArray(ar: any[]): any {
    return ar[Math.floor(Math.random() * ar.length)];
  }
}
