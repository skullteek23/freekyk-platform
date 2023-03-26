import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IActionShortcutData } from '@shared/components/action-shortcut-button/action-shortcut-button.component';
import { IPointersComponentData } from '@shared/components/why-choose-section/why-choose-section.component';
import { ListOption } from '@shared/interfaces/others.model';
import { LANDING_PAGE } from '@shared/web-content/WEBSITE_CONTENT';

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
    { icon: 'sports_handball', label: 'Create match', highlight: false, route: '/create-instant-match' },
  ];
  readonly actionShortcutDataRow_2: IActionShortcutData[] = [
    { icon: 'emoji_events', label: 'Rewards', highlight: false, route: '/rewards' },
    { icon: 'leaderboard', label: ' Leaderboard', highlight: true, route: '/leaderboard' },
    { icon: 'record_voice_over', label: 'Be an organizer', highlight: true, route: '/become-organizer' },
    { icon: 'support_agent', label: 'Support', highlight: false, route: '/support' },
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
    private router: Router
  ) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  selectAction(action: IActionShortcutData) {
    if (action.route) {
      this.router.navigate([action.route])
    }
  }

}
