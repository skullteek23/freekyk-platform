import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { LOREM_IPSUM_SHORT } from 'src/app/shared/Constants/CONSTANTS';
import {
  TeamBasicInfo,
  TeamMembers,
  TeamMoreInfo,
  TeamStats,
  Tmember,
} from 'src/app/shared/interfaces/team.model';

@Component({
  selector: 'app-teams-panel',
  templateUrl: './teams-panel.component.html',
  styleUrls: ['./teams-panel.component.css'],
})
export class TeamsPanelComponent implements OnInit {
  completed = false;
  completed2 = false;
  teamIds: string[] = [];
  constructor(private ngFire: AngularFirestore) {}

  ngOnInit(): void {}
  onAddTeams() {
    var teamBasicProfiles = this.getTeams(4);
    var teamAddiProfile = this.getMoreTeamInfo();
    var teamStats = this.getTeamStats();
    var teamMembers = this.getTeamMembers();
    var teamBatch = this.ngFire.firestore.batch();
    var teamAddiBatch = this.ngFire.firestore.batch();
    for (let m = 0; m < teamBasicProfiles.length; m++) {
      var docRef = this.ngFire.firestore
        .collection('teams')
        .doc(this.teamIds[m]);
      var docRef2 = this.ngFire.firestore
        .collection('teams')
        .doc(this.teamIds[m])
        .collection('additionalInfo')
        .doc('members');
      var docRef3 = this.ngFire.firestore
        .collection('teams')
        .doc(this.teamIds[m])
        .collection('additionalInfo')
        .doc('moreInfo');
      var docRef4 = this.ngFire.firestore
        .collection('teams')
        .doc(this.teamIds[m])
        .collection('additionalInfo')
        .doc('statistics');
      teamBatch.set(docRef, teamBasicProfiles[m]);
      teamAddiBatch.set(docRef2, teamMembers);
      teamAddiBatch.set(docRef3, teamAddiProfile);
      teamAddiBatch.set(docRef4, teamStats);
    }
    let allPromises = [];
    allPromises.push(
      new Promise((resolve, reject) => {
        resolve((this.completed = true));
      })
    );
    allPromises.push(teamBatch.commit().then(() => teamAddiBatch.commit()));
    return Promise.all(allPromises);
  }
  onAddTeam() {
    var teamBasicProfile = this.getTeams(1);
    var teamAddiProfile = this.getMoreTeamInfo();
    var teamStats = this.getTeamStats();
    var teamMembers = this.getTeamMembers();
    this.ngFire
      .collection('teams')
      .doc(teamBasicProfile[0].id)
      .set(teamBasicProfile[0])
      .then(() => {
        let allPromises = [];
        allPromises.push(
          new Promise((resolve, reject) => {
            resolve((this.completed2 = true));
          })
        );

        allPromises.push(
          this.ngFire
            .collection('teams')
            .doc(teamBasicProfile[0].id)
            .collection('additionalInfo')
            .doc('members')
            .set(teamMembers)
        );
        allPromises.push(
          this.ngFire
            .collection('teams')
            .doc(teamBasicProfile[0].id)
            .collection('additionalInfo')
            .doc('moreInfo')
            .set(teamAddiProfile)
        );
        allPromises.push(
          this.ngFire
            .collection('teams')
            .doc(teamBasicProfile[0].id)
            .collection('additionalInfo')
            .doc('statistics')
            .set(teamStats)
        );
        return Promise.all(allPromises);
      });
  }
  getMoreTeamInfo() {
    return <TeamMoreInfo>{
      tdateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
      tageCat: 25,
      captainName: 'Player 2',
      tslogan: 'lorem Ipsum Long Slogan',
      tdesc: LOREM_IPSUM_SHORT,
      tSocials: {
        ig: 'https://www.instagram.com/realmadrid/',
        yt: 'https://www.youtube.com/channel/UCWV3obpZVGgJ3j9FVhEjF2Q',
        fb: 'https://www.facebook.com/RealMadrid',
        tw: 'https://twitter.com/realmadrid',
      },
    };
  }
  getTeamStats() {
    return <TeamStats>{
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
  }
  getTeamMembers() {
    let dummyMembers: Tmember[] = [];

    for (let i = 0; i < 8; i++) {
      dummyMembers.push(<Tmember>{
        name: 'Player ' + i,
        id: this.ngFire.createId(),
        pl_pos: i < 3 ? 'Striker' : i < 6 ? 'Defender' : 'Center Midfielder',
        imgpath_sm:
          'https://images.unsplash.com/photo-1610673751396-84b4ba3978dd?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
      });
    }

    return <TeamMembers>{
      memCount: 8,
      members: dummyMembers,
    };
  }
  getTeams(length: number) {
    let teamProfiles: TeamBasicInfo[] = [];
    let TeamNames: string[] = this.getTeamNames();
    let teamImages: string[] = this.getTeamImages();
    let teamLogos: string[] = this.getTeamLogos();
    for (let i = 0; i < length; i++) {
      teamProfiles.push(<TeamBasicInfo>{
        tname: length != 1 ? TeamNames[i] : 'New Team ' + i,
        isVerified: true,
        imgpath: teamImages[i],
        imgpath_logo: teamLogos[i],
        captainId: this.ngFire.createId(),
        locState: 'Uttar Pradesh',
        locCity: 'Ghaziabad',
        id: length != 1 ? this.getNewId() : this.ngFire.createId(),
      });
    }
    return teamProfiles;
  }
  getNewId() {
    const id = this.ngFire.createId();
    this.teamIds.push(id);
    return id;
  }
  getTeamNames() {
    return [
      'Team A',
      'Team B',
      'Fusers FC',
      'Real Madrid FC',
      'Gardenia FC',
      'Lone Wolf FC',
      'Oscar Delta FC',
    ];
  }
  getTeamImages() {
    return [
      'https://images.unsplash.com/photo-1611119535617-ee346f83bb2c?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1582586302869-715be816f60b?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1582500347014-3fbe150ed85a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
      'https://images.unsplash.com/photo-1542050939822-419d5716b8b3?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1572281004596-898318f2b1b8?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=1350&q=80',
    ];
  }
  getTeamLogos() {
    return [
      'https://images.unsplash.com/photo-1545231027-637d2f6210f8?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80',
      'https://images.unsplash.com/photo-1567446537708-ac4aa75c9c28?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
      'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1553835973-dec43bfddbeb?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      'https://images.unsplash.com/photo-1496200186974-4293800e2c20?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1489&q=80',
    ];
  }
  onOpenTeamForm() {}
}
