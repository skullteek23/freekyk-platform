import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { IActionShortcutData } from '@shared/components/action-shortcut-button/action-shortcut-button.component';
import { IPointersComponentData } from '@shared/components/why-choose-section/why-choose-section.component';
import { ListOption } from '@shared/interfaces/others.model';
import { LANDING_PAGE } from '@shared/web-content/WEBSITE_CONTENT';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  readonly actionShortcutDataRow_1: IActionShortcutData[] = [
    { icon: 'sports_soccer', label: 'Join a game', highlight: true, route: '/games' },
    { icon: 'groups', label: 'Find a team', highlight: false, route: '/teams' },
    { icon: 'tour', label: 'Challenges', highlight: false, route: '/challenges' },
    { icon: 'sports_handball', label: 'Create match', highlight: false, route: '/match/create' },
  ];
  readonly actionShortcutDataRow_2: IActionShortcutData[] = [
    { icon: 'emoji_events', label: 'Rewards & Points', highlight: false, route: '/rewards/earn' },
    { icon: 'leaderboard', label: ' Leaderboard', highlight: true, route: '/leaderboard/played' },
    { icon: 'record_voice_over', label: 'Be an organizer', highlight: true, route: null, extLink: environment.firebase.adminRegister },
    { icon: 'support_agent', label: 'Support', highlight: false, route: '/support/faqs' },
  ];
  readonly quickLinks: ListOption[] = [
    { viewValue: 'Players', value: '/players' },
    { viewValue: 'Teams', value: '/teams' },
    { viewValue: 'Matches', value: '/matches' },
    { viewValue: 'Grounds', value: '/grounds' },
  ];
  readonly howItWorks: IPointersComponentData = LANDING_PAGE.howItWorks;

  playerName = 'Footballer';

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedIn()
      .subscribe({
        next: (user) => {
          if (user?.displayName) {
            this.playerName = user.displayName;
          }
        }
      })
    window.scrollTo(0, 0);
  }

  selectAction(action: IActionShortcutData) {
    if (action.extLink) {
      window.open(action.extLink, '_blank');
    } else if (action.route) {
      this.router.navigate([action.route])
    }
  }

}
