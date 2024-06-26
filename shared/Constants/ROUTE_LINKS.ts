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
    { viewValue: 'my profile', value: 'profile' },
    { viewValue: 'notifications', value: 'notifications' },
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
  isOpen?: boolean;
}

export const MOBILE_LINKS: ILink[] = [
  {
    name: 'Freekyk Play',
    subLinks: [
      // { name: 'Home', route: '/play/home', icon: 'grass' },
      // { name: 'Seasons', route: '/play/seasons', icon: 'try' },
      { name: 'Players', route: '/players', icon: 'sports_handball' },
      { name: 'Teams', route: '/teams', icon: 'diversity_3' },
      { name: 'Matches', route: '/matches', icon: 'calendar_month' },
      { name: 'Grounds', route: '/grounds', icon: 'stadium' },
      { name: 'Standings', route: '/standings', icon: 'leaderboard' },
    ]
  },
  {
    name: 'Organizers & Partners',
    subLinks: [
      { name: 'Join as Organizer', maxWidth: '60%', externalLink: environment.firebase.adminUrl, icon: 'open_in_new' },
      { name: 'Request a callback', maxWidth: '60%', externalLink: environment.forms.partner, icon: 'open_in_new' }
    ]
  },
  {
    name: 'My Account',
    subLinks: [
      { name: 'Orders', route: '/orders', icon: 'list_alt' },
      { name: 'Notifications', route: '/notifications', icon: 'notifications' },
      { name: 'Addresses', route: '/addresses', icon: 'import_contacts' },
      // { name: 'Logout', isLogout: true, icon: 'logout' },
    ]
  },
  {
    name: 'Help & Support',
    subLinks: [
      { name: 'Raise a Ticket', route: '/support/tickets', icon: 'help' },
      { name: 'FAQs', route: '/support/faqs', icon: 'question_answer' }
    ]
  },

  // {
  //   name: 'Organizer',
  //   subLinks: [
  //   ]
  // },

  // {
  //   name: 'Freestyle',
  //   route: '/freestyle/home',
  //   icon: 'movie_filter'
  // },
  // {
  //   name: 'Academies',
  //   route: '/academies',
  //   icon: 'school'
  // },
  // {
  //   name: 'Equipment',
  //   route: '/equipment',
  //   icon: 'add_shopping_cart'
  // },
  // {
  //   name: 'Settings',
  //   route: '/dashboard/account',
  //   icon: 'settings'
  // },
  // {
  //   name: 'Logout',
  //   isLogout: true,
  //   icon: 'logout'
  // },
];

export const DESKTOP_LINKS: ILink[] = [
  {
    name: 'More',
    subLinks: [
      {
        name: 'About',
        route: '/about',
      },
      // {
      //   name: 'Freestyle',
      //   route: '/freestyle/home',
      // },
      // {
      //   name: 'Academies',
      //   route: '/academies',
      // },
      // {
      //   name: 'Equipment',
      //   route: '/equipment',
      // },
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
        route: '/dashboard/account'
      },
      {
        name: 'Logout',
        isLogout: true
      }
    ]
  }
]
