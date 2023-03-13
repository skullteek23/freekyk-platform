import { Component, OnInit, Output } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { LogoutComponent } from '../auth/logout/logout.component';
import { AccountAvatarService } from '../services/account-avatar.service';
import { NotificationsService } from '../services/notifications.service';
import { DESKTOP_LINKS, ILink, MOBILE_LINKS } from '@shared/Constants/ROUTE_LINKS';
import { environment } from 'environments/environment';
import { ISocialGroupConfig, SocialGroupComponent } from '@shared/dialogs/social-group/social-group.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import { LiveSeasonComponent } from '@app/shared/dialogs/live-season/live-season.component';
import { ArraySorting } from '@shared/utils/array-sorting';
import { Router } from '@angular/router';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { SubmitMatchRequestComponent } from '@app/shared/dialogs/submit-match-request/submit-match-request.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  readonly desktopLinks = DESKTOP_LINKS;

  readonly adminURL = environment?.firebase?.adminRegister || '';

  @Output() menOpen = new Subject<boolean>();

  isLoading = true;
  isLogged = false;
  mobileLinks = MOBILE_LINKS;
  seasonsList: SeasonBasicInfo[] = [];
  menuState: boolean;
  profilePicture$: Observable<string | null>;
  notificationCount$: Observable<number | string>;

  treeControl = new NestedTreeControl<ILink>(node => node.subLinks);
  dataSource = new MatTreeNestedDataSource<ILink>();

  constructor(
    private dialog: MatDialog,
    private ngAuth: AngularFireAuth,
    private notificationService: NotificationsService,
    private avatarServ: AccountAvatarService,
    private ngFire: AngularFirestore,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.dataSource.data = MOBILE_LINKS;
    this.menuState = false;
    this.profilePicture$ = this.avatarServ.getProfilePicture();
    this.getLiveSeasons();
    this.ngAuth.user.subscribe((user) => {
      if (user !== null) {
        this.isLogged = true;
        this.notificationCount$ = this.notificationService.notifsCountChanged.pipe(
          map((resp) => (!!resp ? resp : null)),
          map((resp) => (resp > 5 ? '5+' : resp)),
          share()
        );
        this.mobileLinks[this.mobileLinks.findIndex(el => el.name === 'More')].subLinks.push({ name: 'Settings', route: '/dashboard/account', icon: 'settings' });
        this.mobileLinks[this.mobileLinks.findIndex(el => el.name === 'More')].subLinks.push({ name: 'Logout', isLogout: true, icon: 'logout' });
      } else {
        this.isLogged = false;
      }
      this.isLoading = false;
    });
  }

  hasChild = (_: number, node: ILink) => !!node.subLinks && node.subLinks.length > 0;

  getLiveSeasons() {
    const currentTimestamp = new Date().getTime();
    this.ngFire.collection('seasons', query => query.where('lastRegDate', '>=', currentTimestamp)).snapshotChanges()
      .pipe(
        map((resp) => {
          const seasons: SeasonBasicInfo[] = [];
          resp.forEach(doc => {
            const data = doc.payload.doc.data() as SeasonBasicInfo;
            const id = doc.payload.doc.id;
            if (data.status === 'PUBLISHED') {
              seasons.push({ id, ...data } as SeasonBasicInfo);
            }
          });
          return seasons.sort(ArraySorting.sortObjectByKey('lastRegDate', 'desc'));
        }))
      .subscribe({
        next: (response: SeasonBasicInfo[]) => {
          this.seasonsList = response;
        },
        error: () => {
          this.seasonsList = [];
        }
      });
  }

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
