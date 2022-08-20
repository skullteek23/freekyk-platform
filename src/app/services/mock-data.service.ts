import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { randAvatar, randBetweenDate, randCity, randCountry, randNumber, randParagraph, randPhrase, randSentence, randState, randWord } from '@ngneat/falso';
import { PlayerMoreInfo } from '../shared/interfaces/user.model';
import { PLAYING_POSTIIONS, DUMMY_USERS, GENDER, STRONG_FOOT } from '../dummyUsers.constants';
import firebase from 'firebase/app';
import { TeamBasicInfo, TeamMembers, TeamMoreInfo, Tmember } from '../shared/interfaces/team.model';
import { AngularFireFunctions } from '@angular/fire/functions';
@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  readonly STRONG_FOOT: string[] = STRONG_FOOT;
  readonly GENDER: string[] = GENDER;
  readonly MOCK_IDS = 'mock-uids';
  readonly PLAYING_POSITIONS: string[] = PLAYING_POSTIIONS;
  readonly USERS: any[] = DUMMY_USERS;
  readonly TEAM_LOGO_DEFAULT = 'https://images.unsplash.com/photo-1614851099518-055a1000e6d5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80';
  readonly TEAM_PHOTO_DEFAULT = 'https://www.littlethings.info/wp-content/uploads/2014/04/dummy-image-green-e1398449160839.jpg';

  constructor(
    private ngAuth: AngularFireAuth,
    private ngFire: AngularFirestore,
    private ngFunctions: AngularFireFunctions
  ) {
    // this.initFirebaseAuth();
    // this.initFirestore();
    // this.initTeam();
  }

  private initFirebaseAuth(): void {
    for (let i = 0; i < this.USERS.length; i++) {
      const email = this.USERS[i].email;
      setTimeout(() => {
        this.addUser(email, this.USERS[i].password, this.USERS[i].name);
        if (email === 'zmurray@gmail.com') {
          console.log('operation completed!');
        }
      }, 5000);
    }
  }

  private initFirestore(): void {
    for (let i = 0; i < this.USERS.length; i++) {
      const userDetails = {
        nickname: this.USERS[i].nickname,
        name: this.USERS[i].name
      };
      const uid = this.USERS[i].uid;
      setTimeout(() => {
        this.addUserInfo(uid, userDetails);
        if (uid === 'CuqHEBpraUglw5ncToeVrYIWueH3') {
          console.log('operation completed!');
        }
      }, 5000);
    }
  }

  private initTeam(): Promise<any> {
    const allPromises: any[] = [];
    const teamID = this.ngFire.createId();
    const teamInfo: TeamBasicInfo = {
      tname: "Andrew Diggers",
      isVerified: true,
      imgpath: this.TEAM_PHOTO_DEFAULT,
      imgpath_logo: this.TEAM_LOGO_DEFAULT,
      captainId: 'fnVzJwVy4tSitUzqzbhmAiEq0bI2',
      locState: randState(),
      locCity: randCity()
    };
    const teamMoreInfo: TeamMoreInfo = {
      tdateCreated: firebase.firestore.Timestamp.now(),
      tageCat: 30,
      captainName: 'Andrew Goodman',
      tslogan: randPhrase(),
      tdesc: randSentence()
    };
    const membersList: Tmember[] = [
      {
        name: 'Andrew Goodman',
        id: 'fnVzJwVy4tSitUzqzbhmAiEq0bI2',
        pl_pos: 'Right Winger',
        imgpath_sm: 'https://i.pravatar.cc/100',
      },
      {
        name: 'William Bennett',
        id: 'AtJVy95rpVTBF5oIKpMGY9yN0fv2',
        pl_pos: 'Center Midfielder',
        imgpath_sm: 'https://i.pravatar.cc/100',
      },
      {
        id: '4yrGdwrESKMs0cPdIVv0Bkh0dzv1',
        name: 'Daniel Martin',
        pl_pos: 'Right Midfielder',
        imgpath_sm: 'https://i.pravatar.cc/100',
      },
      {
        id: 'hX8OsbWrg4dJ9LKwYCaZ7tSl4rl2',
        name: 'Henry White',
        pl_pos: 'GoalKeeper',
        imgpath_sm: 'https://i.pravatar.cc/100',
      },
      {
        id: '72OPMo3LsYSeOmDuz7AswPa7tVw2',
        name: 'Matthew Smith',
        pl_pos: 'Center Forward',
        imgpath_sm: 'https://i.pravatar.cc/100',
      },
      {
        id: 'ygihPRcCQohLx4Vs9PqdUjr7mzQ2',
        name: 'Hunter Hamilton',
        pl_pos: 'Center Forward',
        imgpath_sm: 'https://i.pravatar.cc/100',
      },
      {
        id: 'AvRW7hEqEedWfptgSSUqs6GXlp52',
        name: 'Nicholas Spencer',
        pl_pos: '	Left Winger',
        imgpath_sm: 'https://i.pravatar.cc/100',
      },
      {
        id: '1nondsTE1RPuXWVuBsIm9MsOvSy2',
        name: 'Brandon West',
        pl_pos: 'Striker',
        imgpath_sm: 'https://i.pravatar.cc/100',
      }
    ]
    const tMembers: TeamMembers = {
      memCount: 8,
      members: membersList,
    };
    allPromises.push(this.ngFire.collection('teams').doc(teamID).set(teamInfo));
    allPromises.push(this.ngFire.collection(`teams/${teamID}/additionalInfo`).doc('moreInfo').set(teamMoreInfo));
    allPromises.push(this.ngFire.collection(`teams/${teamID}/additionalInfo`).doc('members').set(tMembers));

    return Promise.all(allPromises);

  }

  private addUser(email: string, pass: string, name: string): Promise<any> {
    return this.ngAuth.createUserWithEmailAndPassword(email, pass);
  }

  private addUserInfo(uid: string, userDetails: any): Promise<any> {
    const allPromises: any[] = [];
    const avatar = randAvatar();
    const newDetails: PlayerMoreInfo = {
      imgpath_lg: avatar,
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
      name: userDetails.name,
      team: null,
      gen: 'M',
      imgpath_sm: avatar,
      jer_no: randNumber({ min: 2, max: 40 }),
      locCity: randCity(),
      pl_pos: this.getRandomSelectionFromArray(this.PLAYING_POSITIONS),
    };
    allPromises.push(this.ngFire.collection('players').doc(uid).set({
      ...newBasicDetails,
    }));
    allPromises.push(this.ngFire.collection(`players/${uid}/additionalInfo`).doc('otherInfo').set(newDetails));
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
