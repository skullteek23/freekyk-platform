import { Component, OnInit, Output } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { LogoutComponent } from '../auth/logout/logout.component';
import { AccountAvatarService } from '../services/account-avatar.service';
import { NotificationsService } from '../services/notifications.service';
import { RouteLinks } from '@shared/Constants/ROUTE_LINKS';
import { environment } from 'environments/environment';
import { ListOption } from '@shared/interfaces/others.model';
import { ISocialGroupConfig, SocialGroupComponent } from '@shared/dialogs/social-group/social-group.component';
import { ngfactoryFilePath } from '@angular/compiler/src/aot/util';
import { AngularFirestore } from '@angular/fire/firestore';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import { LiveSeasonComponent } from '@app/shared/dialogs/live-season/live-season.component';
import { ArraySorting } from '@shared/utils/array-sorting';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  readonly adminURL = environment?.firebase?.adminRegister || '';
  readonly partnerFormURL = environment?.forms?.partner || '';

  @Output() menOpen = new Subject<boolean>();

  isLoading = true;
  isLogged = false;
  seasonsList: SeasonBasicInfo[] = [];
  menuState: boolean;
  sidenavOpen: boolean;
  profilePicture$: Observable<string | null>;
  playSublinks: ListOption[] = [];
  fsSublinks: ListOption[] = [];
  dashSublinks: ListOption[] = [];
  morelinks: { name: string; route: string }[] = [];
  selectedSubLinks: ListOption[] = [];
  selected: 'dashboard' | 'play' | 'freestyle' | null = null;
  notifCount$: Observable<number | string>;

  constructor(
    private dialog: MatDialog,
    private ngAuth: AngularFireAuth,
    private notificationService: NotificationsService,
    private avatarServ: AccountAvatarService,
    private ngFire: AngularFirestore,
  ) { }

  ngOnInit(): void {
    this.menuState = false;
    this.sidenavOpen = false;
    this.profilePicture$ = this.avatarServ.getProfilePicture();
    this.getLiveSeasons();
    this.ngAuth.user.subscribe((user) => {
      if (user !== null) {
        this.isLogged = true;
        this.notifCount$ = this.notificationService.notifsCountChanged.pipe(
          map((resp) => (!!resp ? resp : null)),
          map((resp) => (resp > 5 ? '5+' : resp)),
          share()
        );
      } else {
        this.isLogged = false;
      }
      this.isLoading = false;
    });

    this.dashSublinks = RouteLinks.DASHBOARD;
    this.playSublinks = RouteLinks.PLAY;
    this.fsSublinks = RouteLinks.FREESTYLE;
    this.morelinks = [
      { name: RouteLinks.OTHERS[0].viewValue, route: `/${RouteLinks.OTHERS[0].value}` },

      { name: RouteLinks.OTHERS[1].viewValue, route: `/${RouteLinks.OTHERS[1].value}` }
    ];
  }

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

  onToggleMenu(): void {
    this.sidenavOpen = false;
    this.menuState = !this.menuState;
    this.menOpen.next(this.menuState);
  }

  onCloseMenu(): void {
    this.sidenavOpen = false;
    this.menuState = false;
    this.menOpen.next(this.menuState);
  }

  onLogout(): void {
    this.sidenavOpen = false;
    this.assignSelected(null);
    this.dialog.open(LogoutComponent);
  }

  onUpdateSubLinks(linkName: 'dashboard' | 'play' | 'freestyle'): void {
    this.assignSelected(linkName);
    switch (linkName) {
      case 'dashboard':
        this.selectedSubLinks = this.dashSublinks;
        break;
      case 'play':
        this.selectedSubLinks = this.playSublinks;
        break;
      case 'freestyle':
        this.selectedSubLinks = this.fsSublinks;
        break;
      default:
        this.selectedSubLinks = [];
    }
    this.sidenavOpen = true;
  }

  assignSelected(value: 'dashboard' | 'play' | 'freestyle' | null): void {
    this.selected = value;
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
}
