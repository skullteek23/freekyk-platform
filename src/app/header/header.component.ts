import { Component, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { LogoutComponent } from '../auth/logout/logout.component';
import { NotificationsService } from '../services/notifications.service';
import { DESKTOP_LINKS, ILink, MOBILE_LINKS } from '@shared/constants/ROUTE_LINKS';
import { environment } from 'environments/environment';
import { ISocialGroupConfig, SocialGroupComponent } from '@shared/dialogs/social-group/social-group.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import { LiveSeasonComponent } from '@app/shared/dialogs/live-season/live-season.component';
import { ArraySorting } from '@shared/utils/array-sorting';
import { NavigationEnd, Router } from '@angular/router';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { SubmitMatchRequestComponent } from '@app/main-shell/components/submit-match-request/submit-match-request.component';
import { AuthService } from '@app/services/auth.service';
import { RewardsGetStartedDialogComponent } from '@app/main-shell/components/rewards-get-started-dialog/rewards-get-started-dialog.component';
import { ApiGetService } from '@shared/services/api.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {

  readonly desktopLinks = DESKTOP_LINKS;
  readonly adminURL = environment?.firebase?.adminRegister || '';

  @Output() menOpen = new Subject<boolean>();

  isLoading = true;
  isLogged = false;
  isOnboarding = false;
  mobileLinks = MOBILE_LINKS;
  // seasonsList: SeasonBasicInfo[] = [];
  menuState: boolean;
  notificationCount$: Observable<number | string>;
  subscriptions = new Subscription();
  userPoints: number = 0;

  treeControl = new NestedTreeControl<ILink>(node => node.subLinks);
  dataSource = new MatTreeNestedDataSource<ILink>();
  photoUrl: string = null;

  constructor(
    private dialog: MatDialog,
    private notificationService: NotificationsService,
    private ngFire: AngularFirestore,
    private router: Router,
    private authService: AuthService,
    private apiService: ApiGetService
  ) { }

  ngOnInit(): void {
    this.dataSource.data = MOBILE_LINKS;
    this.menuState = false;
    // this.getLiveSeasons();
    this.authService.getPhoto().subscribe({
      next: response => {
        this.photoUrl = response;
      },
    })
    this.authService.isLoggedIn().subscribe({
      next: (user) => {
        if (user) {
          this.isLogged = true;
          // this.notificationCount$ = this.notificationService.notifsCountChanged.pipe(
          //   map((resp) => (!!resp ? resp : null)),
          //   map((resp) => (resp > 5 ? '5+' : resp)),
          //   share()
          // );
          this.mobileLinks = MOBILE_LINKS.slice();
          this.mobileLinks[this.mobileLinks.findIndex(el => el.name === 'My Account')]?.subLinks?.push({ name: 'Logout', isLogout: true, icon: 'logout' });
          // this.mobileLinks[this.mobileLinks.findIndex(el => el.name === 'More')].subLinks.push({ name: 'Logout', isLogout: true, icon: 'logout' });
          this.getUserPoints(user.uid);
        }
        this.isLoading = false;
      }
    })
    this.subscriptions.add(this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.isOnboarding = event.url.includes('onboarding');
      }
    }));
  }

  getUserPoints(uid: string) {
    this.subscriptions.add(this.apiService.addUserPointsListener(uid)
      .subscribe({
        next: (response) => {
          if (response?.points >= 0) {
            this.userPoints = response.points;
          }
        },
        error: () => {
          this.userPoints = 0;
        }
      }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  hasChild = (_: number, node: ILink) => !!node.subLinks && node.subLinks.length > 0;

  // getLiveSeasons() {
  //   const currentTimestamp = new Date().getTime();
  //   this.ngFire.collection('seasons', query => query.where('lastRegDate', '>=', currentTimestamp)).snapshotChanges()
  //     .pipe(
  //       map((resp) => {
  //         const seasons: SeasonBasicInfo[] = [];
  //         resp.forEach(doc => {
  //           const data = doc.payload.doc.data() as SeasonBasicInfo;
  //           const id = doc.payload.doc.id;
  //           if (data.status === 'PUBLISHED') {
  //             seasons.push({ id, ...data } as SeasonBasicInfo);
  //           }
  //         });
  //         return seasons.sort(ArraySorting.sortObjectByKey('lastRegDate', 'desc'));
  //       }))
  //     .subscribe({
  //       next: (response: SeasonBasicInfo[]) => {
  //         this.seasonsList = response;
  //       },
  //       error: () => {
  //         this.seasonsList = [];
  //       }
  //     });
  // }

  scrollTop() {
    window.scrollTo(0, 0);
  }

  onToggleMenu(): void {
    this.menuState = !this.menuState;
    this.menOpen.next(this.menuState);
  }

  onCloseMenu(): void {
    this.menuState = false;
    this.menOpen.next(this.menuState);
  }

  onLogout(): void {
    this.onCloseMenu();
    this.dialog.open(LogoutComponent);
  }

  openSocialGroupDialog() {
    const data: ISocialGroupConfig = {
      name: 'Link to WhatsApp Group',
      link: environment.whatsAppCommunity.link,
      image: 'assets/images/whatsappGroupQR.png',
    }
    this.dialog.open(SocialGroupComponent, {
      panelClass: 'fk-dialogs',
      data
    });
  }

  openLiveSeason(data: SeasonBasicInfo) {
    this.dialog.open(LiveSeasonComponent, {
      panelClass: 'fk-dialogs',
      data
    });
  }

  openLink(link: ILink) {
    this.onCloseMenu();
    if (link.route) {
      this.router.navigate([link.route]);
    } else if (link.externalLink) {
      window.open(link.externalLink, '_blank');
    } else if (link.isLogout) {
      this.onLogout();
    }
  }

  openParentLink(link: ILink) {
    if (link.route) {
      this.onCloseMenu();
      this.router.navigate([link.route]);
    }
  }

  openMatchRequestForm() {
    this.dialog.open(SubmitMatchRequestComponent, {
      panelClass: 'fk-dialogs'
    });
  }

  getStartedReward() {
    this.dialog.open(RewardsGetStartedDialogComponent, {
      panelClass: 'fk-dialogs',
      disableClose: true,
      data: this.userPoints
    })
  }

  get playLinks(): ILink[] {
    return this.mobileLinks.find(el => el.name === 'Freekyk Play')?.subLinks;
  }


  get moreDesktopLinks(): ILink[] {
    return this.desktopLinks.find(el => el.name === 'More')?.subLinks;
  }

  get profileAvatarLinks(): ILink[] {
    return this.desktopLinks.find(el => el.name === 'Account Circle')?.subLinks;
  }
}
