import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  GroundBasicInfo,
  GroundMoreInfo,
  GroundPrivateInfo,
} from './shared/interfaces/ground.model';
import { SeasonParticipants } from './shared/interfaces/season.model';
import firebase from 'firebase/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'freekyk7';
  menuOpen = false;
  dashOpen = false;
  routeSubscription: Subscription = new Subscription();
  constructor(private router: Router, private ngFire: AngularFirestore) {}
  ngOnInit() {
    // this.grScript('New Ground 1');
    // this.grScript('New Ground 2');
    // this.grScript('New Ground 3');
    // this.grScript('New Ground 4');
    // this.ssScript('z0bEf2fs0zL6053RJNHc');

    this.routeSubscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        // Hide loading indicator
        this.dashOpen = [
          '/dashboard/home',
          '/dashboard/team-management',
          '/dashboard/freestyle',
          '/dashboard/premium',
          '/dashboard/account',
        ]
          .includes(event.url)
          .valueOf();
      }
    });
  }

  onOpenMenu(eventValue: any) {
    this.menuOpen = eventValue;
  }
  ngOnDestroy() {
    this.routeSubscription.unsubscribe();

    localStorage.removeItem('uid');
  }
  ssScript(sid: string) {
    this.ngFire.collection('seasons/' + sid + '/participants').add(<
      SeasonParticipants
    >{
      tid: '0JXCgvC84gkQDCzR4ebV',
      timgpath:
        'https://images.unsplash.com/photo-1611119535617-ee346f83bb2c?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      tname: 'Team A',
    });
    this.ngFire.collection('seasons/' + sid + '/participants').add(<
      SeasonParticipants
    >{
      tid: 'W23Wzx5ueUO9UzJZvwF0',
      timgpath:
        'https://images.unsplash.com/photo-1542050939822-419d5716b8b3?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      tname: 'Real Madrid FC',
    });
    this.ngFire.collection('seasons/' + sid + '/participants').add(<
      SeasonParticipants
    >{
      tid: 'pws5Tp00LJk8rCXYEtl7',
      timgpath:
        'https://images.unsplash.com/photo-1582500347014-3fbe150ed85a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
      tname: 'Fusers FC',
    });
    this.ngFire.collection('seasons/' + sid + '/participants').add(<
      SeasonParticipants
    >{
      tid: 'sXdqgsAXy9V7RECJoSVV',
      timgpath:
        'https://images.unsplash.com/photo-1611119535617-ee346f83bb2c?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      tname: 'New Team 0',
    });
  }
  grScript(name: string) {
    const newId = this.ngFire.createId();
    const grRef = this.ngFire.collection('grounds').ref;
    const grPvtRef = this.ngFire.collection('groundsTimings').ref;
    const grMoreRef = this.ngFire
      .collection('grounds')
      .doc(newId)
      .collection('additionalInfo').ref;
    const grBasic: GroundBasicInfo = {
      name: name,
      imgpath:
        'https://images.unsplash.com/photo-1584736627140-33a6696801ed?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=635&q=80',
      locCity: 'Ghaziabad',
      locState: 'Uttar Pradesh',
      fieldType: 'FG',
      own_type: 'FK',
      playLvl: 'good',
      id: newId,
    };
    const grMore: GroundMoreInfo = {
      parking: true,
      mainten: true,
      goalp: true,
      opmTimeStart: firebase.firestore.Timestamp.fromDate(new Date()),
      opmTimeEnd: firebase.firestore.Timestamp.fromDate(new Date()),
      washroom: true,
      foodBev: true,
      avgRating: 4,
    };
    const grPvt: GroundPrivateInfo = {
      name: name,
      locCity: 'Ghaziabad',
      locState: 'Uttar Pradesh',
      signedContractFileLink:
        'https://images.unsplash.com/photo-1584736627140-33a6696801ed?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=635&q=80',
      timings: {
        0: [7, 8, 9, 15],
        1: [7, 8, 9, 15],
        2: [7, 8, 9, 15],
        3: [7, 8, 9, 15],
        4: [7, 8, 9, 15],
        5: [7, 8, 9, 15],
        6: [7, 8, 9, 15],
      },
      totAvailHours: 28,
    };
    grRef.doc(newId).set(grBasic);
    grMoreRef.doc('moreInfo').set(grMore);
    grPvtRef.doc(newId).set(grPvt);
  }
}
