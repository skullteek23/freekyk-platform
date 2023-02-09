/* eslint-disable max-len */

import { environment } from "environments/environment";

/* eslint-disable @typescript-eslint/naming-convention */
export const RouteLinks = {
  PLAY: [
    { value: 'home', viewValue: 'home' },
    { value: 'seasons', viewValue: 'seasons' },
    { value: 'players', viewValue: 'players' },
    { value: 'teams', viewValue: 'teams' },
    { value: 'fixtures', viewValue: 'fixtures' },
    { value: 'results', viewValue: 'results' },
    { value: 'standings', viewValue: 'standings' },
    { value: 'grounds', viewValue: 'grounds' },
  ],
  FREESTYLE: [
    { viewValue: 'home', value: 'home' }
  ],
  DASHBOARD: [
    { viewValue: 'home', value: 'home' },
    { viewValue: 'My team', value: 'team-management' },
    { viewValue: 'participate', value: 'participate' },
  ],
  DASHBOARD_ACCOUNT: [
    { viewValue: 'profile', value: 'profile' },
    { viewValue: 'all notifications', value: 'notifications' },
    { viewValue: 'addresses', value: 'addresses' },
    { viewValue: 'tickets', value: 'tickets' },
  ],
  OTHERS: [
    { viewValue: 'about', value: 'about' },
    { viewValue: 'support', value: 'support' },
  ],
};

export interface ISubLink {
  name: string;
  route?: string,
  externalLink?: string,
  isLogout?: true
}

export interface ILink {
  name: string;
  route?: string;
  subLinks: ISubLink[]
}

export const MOBILE_LINKS: ILink[] = [
  {
    name: 'Dashboard',
    subLinks: [
      {
        name: 'Home',
        route: '/dashboard/home',
      },
      {
        name: 'My Team',
        route: '/dashboard/team-management',
      },
      {
        name: 'Participate',
        route: '/dashboard/participate',
      },
    ]
  },
  {
    name: 'Freekyk Play',
    subLinks: [
      {
        name: 'Home',
        route: '/play/home',
      },
      {
        name: 'Grounds',
        route: '/play/grounds',
      },
      {
        name: 'Fixtures',
        route: '/play/fixtures',
      },
      {
        name: 'Seasons',
        route: '/play/seasons',
      },
      {
        name: 'Standings',
        route: '/play/standings',
      },
      {
        name: 'Players',
        route: '/play/players',
      },
      {
        name: 'Results',
        route: '/play/results',
      },
      {
        name: 'Teams',
        route: '/play/teams',
      },
    ]
  },

  {
    name: 'Freekyk Freestyle',
    subLinks: [
      {
        name: 'Home',
        route: '/freestyle/home',
      },
    ]
  },
  {
    name: 'Freekyk Academies',
    subLinks: [
      {
        name: 'Home',
        route: '/academies',
      },
    ]
  },
  {
    name: 'Freekyk Equipment',
    subLinks: [
      {
        name: 'Home',
        route: '/equipment',
      },
    ]
  },
  {
    name: 'More',
    subLinks: [
      {
        name: 'About',
        route: '/about',
      },
      {
        name: 'Support',
        route: '/support',
      },
      {
        name: 'Partner',
        externalLink: environment.forms.partner
      },
      {
        name: 'Admin',
        externalLink: environment.firebase.adminUrl,
      },
      {
        name: 'Logout',
        isLogout: true,
      },
      {
        name: 'Settings',
        route: '/dashboard/account/profile',
      },
    ]
  },

];

export const DESKTOP_LINKS: ILink[] = [
  {
    name: 'More',
    subLinks: [
      {
        name: 'About',
        route: '/about',
      },
      {
        name: 'Freestyle',
        route: '/freestyle/home',
      },
      {
        name: 'Academies',
        route: '/academies',
      },
      {
        name: 'Equipment',
        route: '/equipment',
      },
      {
        name: 'Partner With Us',
        externalLink: environment.forms.partner,
      },
    ]
  },
  {
    name: 'Account Circle',
    subLinks: [
      {
        name: 'Dashboard',
        route: '/dashboard/home'
      },
      {
        name: 'Account & Settings',
        route: '/dashboard/account/profile'
      },
      {
        name: 'Logout',
        isLogout: true
      }
    ]
  }
]
