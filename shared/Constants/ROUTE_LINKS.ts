import { environment } from "environments/environment";

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

export interface ILink {
  name: string;
  route?: string;
  subLinks?: ILink[];
  externalLink?: string,
  isLogout?: true,
  maxWidth?: string;
}

export const MOBILE_LINKS: ILink[] = [
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
    name: 'Partner With Us',
    subLinks: [
      {
        name: 'Request a callback',
        maxWidth: '60%',
        externalLink: environment.forms.partner
      }
    ]
  },
  {
    name: 'Support',
    subLinks: [
      {
        name: 'Tickets',
        route: '/support'
      },
      {
        name: 'FAQs',
        route: '/support/faqs'
      }
    ]
  },
  {
    name: 'Admin',
    subLinks: [
      {
        name: 'Join as Organizer',
        maxWidth: '60%',
        externalLink: environment.firebase.adminUrl,
      }
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
        name: 'Settings',
        route: '/dashboard/account/profile',
      },
      {
        name: 'Logout',
        isLogout: true,
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
