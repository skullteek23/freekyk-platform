import { Component, OnInit, Output } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subject } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { tricks } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-da-fs-journey',
  templateUrl: './da-fs-journey.component.html',
  styleUrls: ['./da-fs-journey.component.css'],
})
export class DaFsJourneyComponent implements OnInit {
  @Output('selectedTrick') trickSelected = new Subject<FsTrick>();
  status: number = 0;
  currentSelection = -1;
  ALL_TRICKS: FsTrick[] = [];
  watcher: any;
  cols: number = 3;
  gutter: string = '';
  apprTricks: number[] = [];
  unapprTricks: number[] = [];
  waitTricks: number[] = [];
  isLoading: boolean = true;
  newTricks: FsTrick[] = [];
  constructor(
    private mediaObs: MediaObserver,
    private ngFire: AngularFirestore
  ) {
    this.watcher = mediaObs
      .asObservable()
      .pipe(
        filter((changes: MediaChange[]) => changes.length > 0),
        map((changes: MediaChange[]) => changes[0])
      )
      .subscribe((change: MediaChange) => {
        if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
          this.gutter = '20px';
          this.cols = 3;
        } else if (change.mqAlias === 'md') {
          this.gutter = '15px';
          this.cols = 4;
        } else {
          this.gutter = '10px';
          this.cols = 5;
        }
      });
  }
  ngOnInit(): void {
    this.initTricksArray();
  }
  async getTricks() {
    const uid = localStorage.getItem('uid');
    let trickSnap = this.ngFire
      .collection('freestylers/' + uid + '/journeyFs')
      .valueChanges()
      .pipe(
        tap((resp) => {
          if (resp == undefined || resp == null) return null;
          resp.forEach((doc) => {
            if ((<tricks>doc).trick_status == 'w')
              this.waitTricks.push(+(<tricks>doc).trick_no);
            else if ((<tricks>doc).trick_status == 'a')
              this.apprTricks.push(+(<tricks>doc).trick_no);
            else if ((<tricks>doc).trick_status == 'u')
              this.unapprTricks.push(+(<tricks>doc).trick_no);
          });
        })
      )
      .subscribe((data) => {
        if (data != null) this.checkLists();
      });
  }
  checkLists() {
    // complete = 1
    // unapproved = 2
    // waiting = 3
    // pending = 4
    this.newTricks = this.ALL_TRICKS.map((trick) => {
      let status = 0;
      if (this.apprTricks.includes(trick.trickNo)) status = 1;
      else if (this.unapprTricks.includes(trick.trickNo)) status = 2;
      else if (this.waitTricks.includes(trick.trickNo)) status = 3;
      return { ...trick, userStatus: status };
    });

    this.isLoading = false;
  }

  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
  onSelect(trick: FsTrick) {
    this.trickSelected.next(trick);
  }
  private initTricksArray() {
    this.ALL_TRICKS = [
      new FsTrick(
        1,
        'atw',
        1,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',
        'https://www.youtube.com/watch?v=ANyOZIcGvB8'
      ),
      new FsTrick(
        2,
        'hop the world',
        1,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        3,
        'headstall',
        1,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        4,
        'crossover',
        1,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        5,
        'toe bounce',
        1,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        6,
        'rainbow',
        1,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        7,
        'hamstring stall',
        1,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        8,
        'pildriver',
        1,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        9,
        'hotstepper',
        1,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        10,
        'shoulderstall',
        1,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        11,
        'knee catch',
        1,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        12,
        'dislocated',
        1,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        13,
        'knee',
        1,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        14,
        'footstall',
        1,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),

      new FsTrick(
        15,
        'around the moon',
        1,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        16,
        'neck hop the world',
        2,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        17,
        'henry flick up',
        2,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        18,
        '360',
        2,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        19,
        'in the ditch',
        2,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        20,
        'bambini',
        2,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        21,
        'khtw',
        2,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        22,
        'nix atw',
        2,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        23,
        'side headstall',
        2,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        24,
        'nosestall',
        2,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        25,
        'reverse toe bounce',
        2,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        26,
        'head juggles',
        2,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        27,
        'heel spin',
        2,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        28,
        'the clock',
        2,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        29,
        'tatsulow head trick',
        2,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),

      new FsTrick(
        30,
        'touzani atw',
        2,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        31,
        'hopping/home touzani atw',
        2,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        32,
        'knee atw',
        3,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        33,
        'abbas atw',
        3,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        34,
        'lemmens atw',
        3,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        35,
        'mitchy atw',
        3,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        36,
        'hopping mitchy atw',
        3,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        37,
        'alternate touzani atw',
        3,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        38,
        'jay atw',
        3,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        39,
        'new shit',
        3,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        40,
        'timo atw',
        3,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        41,
        'sole juggles',
        3,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        42,
        'gerbashi breakdancing',
        3,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
      new FsTrick(
        43,
        'knee mitchy atw',
        3,
        'A complete revolution around the ball using your foot. As you are juggling, hit the ball with either the inside or outside of the foot (depending on which way you are going around the ball) to give it a bit of a spin. Your foot should make a complete revolution around the ball and come back under the ball to continue juggling. It is perhaps one of the most basic freestyle tricks. Practice is the key.',

        'https://www.youtube.com/watch?v=mXo_I0hUoyg'
      ),
    ];
    this.getTricks();
  }
}
class FsTrick {
  constructor(
    public trickNo: number,
    public trick_name_sh: string,
    public trickSkillLvl: number,
    public trick_desc: string,
    public trickHelpVideo: string,
    public userStatus?: number
  ) {}
}
