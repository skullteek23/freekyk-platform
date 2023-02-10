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
  icon?: string;
}

export const MOBILE_LINKS: ILink[] = [
  {
    name: 'Freekyk Play',
    subLinks: [
      {
        name: 'Home',
        route: '/play/home',
        icon: 'grass'
      },
      {
        name: 'Grounds',
        route: '/play/grounds',
        icon: 'stadium'
      },
      {
        name: 'Fixtures',
        route: '/play/fixtures',
        icon: 'calendar_month'
      },
      {
        name: 'Seasons',
        route: '/play/seasons',
        icon: 'try'
      },
      {
        name: 'Standings',
        route: '/play/standings',
        icon: 'leaderboard'
      },
      {
        name: 'Players',
        route: '/play/players',
        icon: 'sports_handball'
      },
      {
        name: 'Results',
        route: '/play/results',
        icon: 'event_available'
      },
      {
        name: 'Teams',
        route: '/play/teams',
        icon: 'diversity_3'
      },
    ]
  },
  {
    name: 'Partner With Us',
    subLinks: [
      {
        name: 'Request a callback',
        maxWidth: '60%',
        externalLink: environment.forms.partner,
        icon: 'open_in_new'
      }
    ]
  },
  {
    name: 'Support',
    subLinks: [
      {
        name: 'Raise a Ticket',
        route: '/support',
        icon: 'help'
      },
      {
        name: 'FAQs',
        route: '/support/faqs',
        icon: 'question_answer'
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
        icon: 'open_in_new'
      }
    ]
  },
  {
    name: 'More',
    subLinks: [
      {
        name: 'About',
        route: '/about',
        icon: 'article'
      },

      {
        name: 'Freestyle',
        route: '/freestyle/home',
        icon: 'movie_filter'
      },
      {
        name: 'Academies',
        route: '/academies',
        icon: 'school'
      },
      {
        name: 'Equipment',
        route: '/equipment',
        icon: 'add_shopping_cart'
      },
      {
        name: 'Settings',
        route: '/dashboard/account/profile',
        icon: 'settings'
      },
      {
        name: 'Logout',
        isLogout: true,
        icon: 'logout'
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
