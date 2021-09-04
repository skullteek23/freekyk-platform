import { Component, OnInit, Output } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { LogoutComponent } from '../auth/logout/logout.component';
import { NotificationsService } from '../services/notifications.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Output('menOpen') onChangeMenuState = new Subject<boolean>();
  isLoading: boolean = true;
  isLogged: boolean = false;
  menuState: boolean;
  sidenavOpen: boolean;
  profile_picture: string | null = null;
  playSublinks: string[] = [];
  fsSublinks: string[] = [];
  dashSublinks: string[] = [];
  morelinks: { name: string; route: string }[] = [];
  curr_sublinks: string[] = [];
  selected: 'dashboard' | 'play' | 'freestyle' | null = null;
  notifCount$: Observable<number | string>;
  constructor(
    private dialog: MatDialog,
    private ngAuth: AngularFireAuth,
    private notifServ: NotificationsService
  ) {}
  ngOnInit(): void {
    this.menuState = false;
    this.sidenavOpen = false;

    this.ngAuth.user.subscribe((user) => {
      if (user !== null) {
        this.profile_picture = user.photoURL;
        this.isLogged = true;
        this.notifCount$ = this.notifServ.notifsCountChanged.pipe(
          map((resp) => (!!resp ? resp : 0)),
          map((resp) => (resp > 5 ? '5+' : resp)),
          share()
        );
      } else {
        this.isLogged = false;
      }
      this.isLoading = false;
    });

    this.dashSublinks = ['home', 'team management', 'freestyle', 'premium'];
    this.playSublinks = [
      'home',
      'seasons',
      'players',
      'teams',
      'fixtures',
      'results',
      'standings',
      'grounds',
    ];
    this.fsSublinks = ['home', 'freestylers', 'leaderboard', 'contests'];
    this.morelinks = [
      { name: 'about', route: '/about' },

      { name: 'support', route: '/support' },
    ];
  }
  onToggleMenu() {
    this.sidenavOpen = false;
    this.menuState = !this.menuState;
    this.onChangeMenuState.next(this.menuState);
  }
  onCloseMenu() {
    this.sidenavOpen = false;
    this.menuState = false;
    this.onChangeMenuState.next(this.menuState);
  }
  onLogout() {
    this.sidenavOpen = false;
    this.assignSelected(null);
    this.dialog.open(LogoutComponent);
  }

  onUpdateSubLinks(linkName: 'dashboard' | 'play' | 'freestyle') {
    this.assignSelected(linkName);
    switch (linkName) {
      case 'dashboard':
        this.curr_sublinks = this.dashSublinks;
        break;
      case 'play':
        this.curr_sublinks = this.playSublinks;
        break;
      case 'freestyle':
        this.curr_sublinks = this.fsSublinks;
        break;
      default:
        this.curr_sublinks = [];
    }
    this.sidenavOpen = true;
  }

  assignSelected(value: 'dashboard' | 'play' | 'freestyle' | null) {
    this.selected = value;
  }
}
