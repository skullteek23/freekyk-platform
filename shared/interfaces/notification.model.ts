export enum NotificationTypes {
  playerJoinRequest = 0,
  captainJoinInvite = 1,
  teamWelcome = 2,
  challengeTeam = 3
}

export const NotificationTitles = [
  'Team Join Request',
  'Team Join Invite',
  'Welcome to the team!',
  'Challenge received!',
]

export const NotificationFormatter = {
  formatTitle: (key: number): string => {
    return NotificationTitles[key];
  }
}

export interface NotificationBasic {
  read: number,
  senderID: string,
  senderName: string,
  receiverID: string,
  receiverName: string,
  date: number,
  type: NotificationTypes,
  id?: string;
  expire: number;
}

