import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import faker from 'faker';
import firebase from 'firebase/app';
import { CLOUD_FUNCTIONS } from '../shared/Constants/CLOUD_FUNCTIONS';
import {
  GroundBasicInfo,
  GroundMoreInfo,
  GroundPrivateInfo,
} from '../shared/interfaces/ground.model';
import { logDetails } from '../shared/interfaces/others.model';
import {
  SeasonAbout,
  SeasonBasicInfo,
  SeasonMedia,
  SeasonStats,
} from '../shared/interfaces/season.model';
import {
  BasicStats,
  FsStats,
  PlayerMoreInfo,
} from '../shared/interfaces/user.model';
import {
  TeamBasicInfo,
  TeamMedia,
  TeamMembers,
  TeamMoreInfo,
  TeamStats,
  Tmember,
} from '../shared/interfaces/team.model';
import { MatchFixture } from '../shared/interfaces/match.model';
@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  readonly STRONG_FOOT = ['L', 'R'];
  readonly GENDER = ['M', 'F'];
  readonly MOCK_IDS = 'mock-uids';
  readonly MOCK_TEAMS = 'mock-teams';
  readonly NO_OF_USERS = 25;
  readonly NO_OF_SEASONS = 6;
  readonly NO_OF_GROUNDS = 10;
  readonly NO_OF_TEAMS = 6;
  readonly PLAYING_POSITIONS: string[] = [
    'Striker',
    'Left Winger',
    'Right Winger',
    'Center Forward',
    'Center Midfielder',
    'Right Midfielder',
    'Left Midfielder',
    'Center Back',
    'Left Back',
    'Right Back',
    'GoalKeeper',
  ];
  readonly CONTAINING_TOURNAMENTS = ['FKC', 'FCP', 'FPL'];
  readonly TRUTHY_FALSY = [true, false];
  readonly PAYMENT_METHODS = ['Online', 'Offline'];
  readonly GROUND_FIELD_TYPES = ['FG', 'SG', 'HG', 'AG', 'TURF'];
  readonly GROUND_OWN_TYPES = ['FK', 'PUBLIC', 'PRIVATE'];
  readonly GROUND_PLAY_CONDITION = ['good', 'best', 'fair'];

  private addUsersInFireAuth(
    newEmail: string,
    newPassw: string,
    name: string
  ): any {
    const user: logDetails = {
      email: newEmail,
      pass: newPassw,
    };
    return this.ngAuth
      .createUserWithEmailAndPassword(user.email, user.pass)
      .then((User) => {
        // saving mock uids
        let mockIds: any[] = [];
        mockIds = JSON.parse(localStorage.getItem(this.MOCK_IDS)) as any[];
        if (!mockIds) {
          mockIds = [];
        }
        mockIds.push(User.user.uid);
        localStorage.setItem(this.MOCK_IDS, JSON.stringify(mockIds));
        // saving mock uids

        // generating mock profiles via cloud function
        const callable = this.ngFunc.httpsCallable(
          CLOUD_FUNCTIONS.CREATE_PROFILE
        );
        return callable({ name, uid: User.user.uid }).toPromise();
        // generating mock profiles via cloud function
      });
  }
  private updateUserStatsInFirestore(uid: string): any {
    const newPlayerStats: BasicStats = {
      apps: 0,
      g: 0,
      w: 0,
      cards: 0,
      l: 0,
    };
    const newFsStats: FsStats = {
      sk_lvl: 0,
      br_colb: [],
      top_vids: [],
      tr_a: 0,
      tr_w: 0,
      tr_u: 0,
    };
    const twoPromises: any[] = [];
    twoPromises.push(
      this.ngFire
        .collection(`players/${uid}/additionalInfo`)
        .doc('statistics')
        .set(newPlayerStats)
    );
    twoPromises.push(
      this.ngFire
        .collection(`freestylers/${uid}/additionalInfoFs`)
        .doc('statistics')
        .set(newFsStats)
    );
    return Promise.all(twoPromises);
  }
  private addUserAdditionalInfoInFirestore(uid: string): any {
    const allPromises: any[] = [];
    const newDetails: PlayerMoreInfo = {
      imgpath_lg: faker.image.people(),
      profile: true,
      born: faker.date.between(
        new Date('1 january 1991'),
        new Date('1 january 2005')
      ),
      locState: faker.address.state(),
      locCountry: faker.address.country(),
      nickname: faker.lorem.word(5),
      height: faker.datatype.number({ max: 220, min: 120 }),
      weight: faker.datatype.number({ max: 120, min: 40 }),
      str_ft: this.getRandomSelectionFromArray(this.STRONG_FOOT) as 'L' | 'R',
      bio: faker.lorem.sentence(5, 6),
      prof_teams: [
        `${faker.lorem.word()} FC`,
        `${faker.lorem.word()} FC`,
        `${faker.lorem.word()} FC`,
      ],
      prof_tours: [
        `${faker.lorem.words(2)} Championship`,
        `${faker.lorem.words(2)} Tournament`,
        `${faker.lorem.words(2)} Competition`,
      ],
    };
    const newBasicDetails = {
      gen: this.GENDER[0],
      imgpath_sm: newDetails.imgpath_lg,
      jer_no: faker.datatype.number({ max: 40, min: 2 }),
      locCity: faker.address.city(),
      pl_pos: this.getRandomSelectionFromArray(this.PLAYING_POSITIONS),
    };
    allPromises.push(
      this.ngFire
        .collection(`players/${uid}/additionalInfo`)
        .doc('otherInfo')
        .set(newDetails)
    );
    allPromises.push(
      this.ngFire
        .collection('players')
        .doc(uid)
        .update({
          ...newBasicDetails,
        })
    );
    allPromises.push(
      this.ngFire.collection('freestylers').doc(uid).update({
        born: newDetails.born,
        nickname: newDetails.nickname,
        gen: newBasicDetails.gen,
      })
    );
    return Promise.all(allPromises);
  }
  private addSeasonsInFirestore(): any {
    const allPromises: any[] = [];
    const newSeasonID = this.ngFire.createId();
    const newSeason: SeasonBasicInfo = {
      id: newSeasonID,
      name: `${faker.lorem.word(7)} Football Season`,
      imgpath: faker.image.sports(),
      locCity: faker.address.city(),
      locState: faker.address.state(),
      premium: this.getRandomSelectionFromArray(this.TRUTHY_FALSY),
      start_date: faker.date.future(),
      cont_tour: this.CONTAINING_TOURNAMENTS.sort(
        () => Math.random() - Math.random()
      ).slice(0, 2),
    };
    const newSeasonMoreInfo: SeasonAbout = {
      description: faker.lorem.paragraph(5),
      rules: faker.lorem.paragraph(5),
      paymentMethod: this.getRandomSelectionFromArray(this.PAYMENT_METHODS) as
        | 'Offline'
        | 'Online',
    };
    const newSeasonMedia: SeasonMedia = {
      photo_1: faker.image.sports(),
      photo_2: faker.image.sports(),
      photo_3: faker.image.sports(),
      photo_4: faker.image.sports(),
      photo_5: faker.image.sports(),
    };
    const newSeasonStatistics: SeasonStats = {
      FKC_winner: null,
      FPL_winner: null,
      totParticipants: 0,
      totGoals: 0,
      awards: faker.lorem.words(4),
    };
    allPromises.push(
      this.ngFire.collection(`seasons`).doc(newSeasonID).set(newSeason)
    );
    allPromises.push(
      this.ngFire
        .collection(`seasons/${newSeasonID}/additionalInfo`)
        .doc('moreInfo')
        .set(newSeasonMoreInfo)
    );
    allPromises.push(
      this.ngFire
        .collection(`seasons/${newSeasonID}/additionalInfo`)
        .doc('media')
        .set(newSeasonMedia)
    );
    allPromises.push(
      this.ngFire
        .collection(`seasons/${newSeasonID}/additionalInfo`)
        .doc('statistics')
        .set(newSeasonStatistics)
    );
    return Promise.all(allPromises);
  }
  private addGroundsInFirestore(): any {
    const allPromises: any[] = [];
    const newGroundId = this.ngFire.createId();
    const startTime = faker.date.future();
    const endTime = new Date();
    endTime.setHours(
      (startTime as Date).getHours() +
        faker.datatype.number({
          min: 1,
          max: 9,
        })
    );
    const newGround: GroundBasicInfo = {
      name: `${faker.lorem.word(8)} Football Ground`,
      imgpath: faker.image.sports(),
      locCity: faker.address.city(),
      locState: faker.address.state(),
      fieldType: this.getRandomSelectionFromArray(this.GROUND_FIELD_TYPES) as
        | 'FG'
        | 'SG'
        | 'HG'
        | 'AG'
        | 'TURF',
      own_type: this.getRandomSelectionFromArray(this.GROUND_OWN_TYPES) as
        | 'FK'
        | 'PUBLIC'
        | 'PRIVATE',
      playLvl: this.getRandomSelectionFromArray(this.GROUND_PLAY_CONDITION) as
        | 'good'
        | 'best'
        | 'fair',
      id: newGroundId,
    };
    const newGroundMore: GroundMoreInfo = {
      parking: this.getRandomSelectionFromArray(this.TRUTHY_FALSY),
      mainten: this.getRandomSelectionFromArray(this.TRUTHY_FALSY),
      goalp: this.getRandomSelectionFromArray(this.TRUTHY_FALSY),
      opmTimeStart: firebase.firestore.Timestamp.fromDate(startTime),
      opmTimeEnd: firebase.firestore.Timestamp.fromDate(endTime),
      washroom: this.getRandomSelectionFromArray(this.TRUTHY_FALSY),
      foodBev: this.getRandomSelectionFromArray(this.TRUTHY_FALSY),
      avgRating: this.getAvgRating(5),
    };
    const newGroundPvtInfo: GroundPrivateInfo = {
      name: newGround.name,
      locCity: newGround.locCity,
      locState: newGround.locState,
      signedContractFileLink: faker.internet.url(),
      timings: null,
      totAvailHours: 0,
    };

    allPromises.push(
      this.ngFire.collection(`grounds`).doc(newGroundId).set(newGround)
    );
    allPromises.push(
      this.ngFire
        .collection(`grounds/${newGroundId}/additionalInfo`)
        .doc('moreInfo')
        .set(newGroundMore)
    );
    allPromises.push(
      this.ngFire
        .collection(`groundsPvt`)
        .doc(newGroundId)
        .set(newGroundPvtInfo)
    );

    return Promise.all(allPromises);
  }
  addTeamsInFirestore(captUID: string, captName: string): any {
    const allPromises: any[] = [];
    const newTeamId = this.ngFire.createId();
    const newTeam: TeamBasicInfo = {
      tname: `${faker.lorem.word(6)} FC`,
      isVerified: this.getRandomSelectionFromArray(this.TRUTHY_FALSY),
      imgpath: faker.image.sports(),
      imgpath_logo: faker.image.people(),
      captainId: captUID,
      locState: faker.address.state(),
      locCity: faker.address.city(),
    };
    const teamMore: TeamMoreInfo = {
      tdateCreated: firebase.firestore.Timestamp.fromDate(faker.date.past()),
      tageCat: 25,
      captainName: captName,
      tslogan: faker.lorem.sentence(4, 7),
      tdesc: faker.lorem.paragraph(),
      tSocials: {
        ig: faker.internet.url(),
        yt: faker.internet.url(),
        fb: faker.internet.url(),
        tw: faker.internet.url(),
      },
    };
    const teamStats: TeamStats = {
      played: {
        fkc: 0,
        fcp: 0,
        fpl: 0,
      },
      w: 0,
      g: 0,
      l: 0,
      rcards: 0,
      ycards: 0,
      cl_sheet: 0,
      g_conceded: 0,
      pr_tour_wins: 0,
    };
    const teamMembers: TeamMembers = {
      memCount: 8,
      members: this.getMembers(captUID),
    };
    const teamMedia: TeamMedia = {
      media: [
        faker.image.sports(),
        faker.image.nature(),
        faker.image.people(),
        faker.image.sports(),
        faker.image.people(),
      ],
    };

    this.saveTeamToLocalStorage(newTeam.tname, newTeamId, captUID);

    allPromises.push(
      this.ngFire.collection(`teams`).doc(newTeamId).set(newTeam)
    );
    allPromises.push(
      this.ngFire
        .collection(`teams/${newTeamId}/additionalInfo`)
        .doc('members')
        .set(teamMembers)
    );
    allPromises.push(
      this.ngFire
        .collection(`teams/${newTeamId}/additionalInfo`)
        .doc('moreInfo')
        .set(teamMore)
    );
    allPromises.push(
      this.ngFire
        .collection(`teams/${newTeamId}/additionalInfo`)
        .doc('media')
        .set(teamMedia)
    );
    allPromises.push(
      this.ngFire
        .collection(`teams/${newTeamId}/additionalInfo`)
        .doc('statistics')
        .set(teamStats)
    );

    for (let i = 0; i < teamMembers.memCount; i++) {
      const newTeamObj = {
        name: newTeam.tname,
        id: newTeamId,
        capId: captUID,
      };
      allPromises.push(
        this.ngFire
          .collection('players')
          .doc(teamMembers.members[i].id)
          .update({
            team: newTeamObj,
          })
      );
    }

    return Promise.all(allPromises);
  }
  addFixturesInFirestore(): void {
    const fixtures: MatchFixture[] = [];
    const sid = 'tempore Football Season';
    for (let i = 0; i < 8; i++) {
      fixtures.push({
        date: firebase.firestore.Timestamp.fromDate(faker.date.soon()),
        concluded: false,
        teams: [`${faker.lorem.word(6)} FC`, `${faker.lorem.word(6)} FC`],
        logos: [faker.image.people(), faker.image.people()],
        season: sid,
        premium: true,
        type: 'FKC',
        locCity: faker.address.city(),
        locState: faker.address.state(),
        fkc_status: 'R16',
      } as MatchFixture);
    }

    for (let i = 0; i < 4; i++) {
      fixtures.push({
        date: firebase.firestore.Timestamp.fromDate(faker.date.soon()),
        concluded: false,
        teams: [`${faker.lorem.word(6)} FC`, `${faker.lorem.word(6)} FC`],
        logos: [faker.image.people(), faker.image.people()],
        season: sid,
        premium: true,
        type: 'FKC',
        locCity: faker.address.city(),
        locState: faker.address.state(),
        fkc_status: 'R8',
      } as MatchFixture);
    }

    fixtures.push({
      date: firebase.firestore.Timestamp.fromDate(faker.date.soon()),
      concluded: false,
      teams: [`${faker.lorem.word(6)} FC`, `${faker.lorem.word(6)} FC`],
      logos: [faker.image.people(), faker.image.people()],
      season: sid,
      premium: true,
      type: 'FKC',
      locCity: faker.address.city(),
      locState: faker.address.state(),
      fkc_status: 'R4',
    } as MatchFixture);

    fixtures.push({
      date: firebase.firestore.Timestamp.fromDate(faker.date.soon()),
      concluded: false,
      teams: [`${faker.lorem.word(6)} FC`, `${faker.lorem.word(6)} FC`],
      logos: [faker.image.people(), faker.image.people()],
      season: sid,
      premium: true,
      type: 'FKC',
      locCity: faker.address.city(),
      locState: faker.address.state(),
      fkc_status: 'R4',
    } as MatchFixture);

    fixtures.push({
      date: firebase.firestore.Timestamp.fromDate(faker.date.soon()),
      concluded: false,
      teams: [`${faker.lorem.word(6)} FC`, `${faker.lorem.word(6)} FC`],
      logos: [faker.image.people(), faker.image.people()],
      season: sid,
      premium: true,
      type: 'FKC',
      locCity: faker.address.city(),
      locState: faker.address.state(),
      fkc_status: 'F',
    } as MatchFixture);

    for (const fixture of fixtures) {
      const docid = this.ngFire.createId();
      this.ngFire.collection('allMatches').doc(docid).set(fixture);
    }
  }
  private startFromAuth(): any {
    const id = setInterval(() => {
      this.addUsersInFireAuth(
        faker.internet.email(),
        faker.internet.password(),
        faker.name.findName()
      );
    }, 2000);
    setTimeout(() => {
      clearInterval(id);
      console.log('cleared!');
    }, this.NO_OF_USERS * 2000);
  }
  private startFromMoreInfo(): any {
    const mockIds = JSON.parse(localStorage.getItem(this.MOCK_IDS)) as any[];
    if (!mockIds) {
      return;
    }
    for (let i = 0; i < mockIds.length; i++) {
      setTimeout(() => {
        this.addUserAdditionalInfoInFirestore(mockIds[i]);
      }, i * 250);
    }
  }
  private startFromSeasons(): any {
    const id = setInterval(() => {
      this.addSeasonsInFirestore();
    }, 2000);
    setTimeout(() => {
      clearInterval(id);
      console.log('cleared!');
    }, this.NO_OF_SEASONS * 2000);
  }
  private startFromGrounds(): any {
    const id = setInterval(() => {
      this.addGroundsInFirestore();
    }, 2000);
    setTimeout(() => {
      clearInterval(id);
      console.log('cleared!');
    }, this.NO_OF_GROUNDS * 2000);
  }
  private startFromTeams(): any {
    const mockIds = JSON.parse(localStorage.getItem(this.MOCK_IDS)) as string[];
    if (!mockIds) {
      return;
    }
    for (let i = 0; i < this.NO_OF_TEAMS * 8; i += 8) {
      setTimeout(() => {
        this.addTeamsInFirestore(mockIds[i], faker.name.findName());
      }, i * 100);
    }
    console.log('cleared!');
  }
  constructor(
    private ngAuth: AngularFireAuth,
    private ngFire: AngularFirestore,
    private ngFunc: AngularFireFunctions
  ) {
    // this.startFromAuth();
    // this.startFromMoreInfo();
    // this.startFromSeasons();
    // this.startFromGrounds();
    // this.startFromTeams();
    // this.addFixturesInFirestore();
  }

  // helper functions
  private getAvgRating(maxRating: number): number {
    return +(Math.random() + Math.floor(Math.random() * maxRating)).toFixed(1);
  }
  private getRandomSelectionFromArray(ar: any[]): any {
    return ar[Math.floor(Math.random() * ar.length)];
  }
  private getMembers(captUID: string): Tmember[] {
    let membersID = JSON.parse(localStorage.getItem(this.MOCK_IDS)) as string[];
    const captId = membersID.findIndex((el) => el === captUID);
    membersID = membersID.slice(captId, captId + 8);
    const teamMembers: Tmember[] = [];
    membersID.forEach((memberId) => {
      teamMembers.push({
        name: faker.name.findName(),
        id: memberId,
        pl_pos: this.getRandomSelectionFromArray(this.PLAYING_POSITIONS),
        imgpath_sm: faker.image.imageUrl(),
      });
    });
    return teamMembers;
  }
  private saveTeamToLocalStorage(
    tname: string,
    tid: string,
    captUID: string
  ): boolean {
    const teamInfo = { tname, tid, captUID };
    let teams: any[] = JSON.parse(localStorage.getItem(this.MOCK_TEAMS));
    if (!teams) {
      teams = [];
    }
    teams.push(teamInfo);
    localStorage.setItem(this.MOCK_TEAMS, JSON.stringify(teams));
    return true;
  }
}
