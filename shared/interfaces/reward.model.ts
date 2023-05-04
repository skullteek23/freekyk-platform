export interface IPoint {
  points: number;
}

export enum LogType {
  debit = 0,
  credit = 1
}
export type IRewardReceiver = 'player' | 'admin' | 'team';

export interface IPointsLog {
  timestamp: number;
  points: number;
  uid: string;
  type: LogType;
  entity: string;
}

export interface ActivityListOption {
  points: number;
  description: string;
  route?: string;
}

export enum RewardableActivities {
  onboarding = 0,
  openPlayerCard = 1,
  openTeamPage = 2,
  completeProfile = 3,
  openNotification = 4,
  requestMatch = 5,
  joinPickupGame = 6,
  // sendTeamRequest = 7,
  // createTeam = 8,
  // joinTeam = 9,
  // invitePlayerToTeam = 10,
  // createTeamCommunicationThread = 11,
  // uploadTeamPicture = 12,
}

export const RewardPoints = {
  [RewardableActivities.onboarding]: 10,
  [RewardableActivities.openPlayerCard]: 5,
  [RewardableActivities.openTeamPage]: 5,
  [RewardableActivities.completeProfile]: 15,
  [RewardableActivities.openNotification]: 5,
  [RewardableActivities.requestMatch]: 10,
  [RewardableActivities.joinPickupGame]: 50,
  // [RewardableActivities.sendTeamRequest]: 15,
  // [RewardableActivities.createTeam]: 50,
  // [RewardableActivities.joinTeam]: 50,
  // [RewardableActivities.invitePlayerToTeam]: 20,
  // [RewardableActivities.createTeamCommunicationThread]: 10,
  // [RewardableActivities.uploadTeamPicture]: 20,
}

export const RewardMessage = {
  [RewardableActivities.onboarding]: 'signup up',
  [RewardableActivities.openPlayerCard]: 'opening player card',
  [RewardableActivities.openTeamPage]: 'opening team page',
  [RewardableActivities.completeProfile]: 'completing profile',
  [RewardableActivities.openNotification]: 'opening notification',
  [RewardableActivities.requestMatch]: 'requesting a match',
  [RewardableActivities.joinPickupGame]: 'joining a pickup game',
  // [RewardableActivities.sendTeamRequest]: 'sending team request',
  // [RewardableActivities.createTeam]: 'creating a team',
  // [RewardableActivities.joinTeam]: 'joining a team',
  // [RewardableActivities.invitePlayerToTeam]: 'inviting players to team',
  // [RewardableActivities.createTeamCommunicationThread]: 'initiating team communication',
  // [RewardableActivities.uploadTeamPicture]: 'uploading team photo',
}

export const RewardActivityDescription = {
  [RewardableActivities.onboarding]: 'sign up & login',
  [RewardableActivities.openPlayerCard]: `Check a Player's Profile`,
  [RewardableActivities.openTeamPage]: 'Check a Team',
  [RewardableActivities.completeProfile]: 'Complete your Profile',
  [RewardableActivities.openNotification]: 'Open your first Notification',
  [RewardableActivities.requestMatch]: 'Request your first match',
  [RewardableActivities.joinPickupGame]: 'Join your first Pick-Up Game',
  // [RewardableActivities.sendTeamRequest]: 'Send request to a Team',
  // [RewardableActivities.createTeam]: 'Create a New Team',
  // [RewardableActivities.joinTeam]: 'Join a New Team',
  // [RewardableActivities.invitePlayerToTeam]: 'Invite a New Player to your Team',
  // [RewardableActivities.createTeamCommunicationThread]: 'Create your first Team Communication thread',
  // [RewardableActivities.uploadTeamPicture]: 'Upload your first Team Picture',
}

export const RewardActivityRoutes = {
  [RewardableActivities.onboarding]: '/signup',
  [RewardableActivities.openPlayerCard]: '/players',
  [RewardableActivities.openTeamPage]: '/teams',
  [RewardableActivities.completeProfile]: '/edit-profile',
  [RewardableActivities.openNotification]: '/notifications',
  [RewardableActivities.requestMatch]: '/my-matches',
  [RewardableActivities.joinPickupGame]: '/games',
  // [RewardableActivities.sendTeamRequest]: '/teams',
  // [RewardableActivities.createTeam]: '/team/create',
  // [RewardableActivities.joinTeam]: '/teams',
  // [RewardableActivities.invitePlayerToTeam]: '/my-team',
  // [RewardableActivities.createTeamCommunicationThread]: '/my-team#communication',
  // [RewardableActivities.uploadTeamPicture]: '/my-team',
}

export const PURCHASE_POINTS_PACK = [10, 25, 50, 100, 200, 500, 1000, 2000, 5000, 10000];

export interface ICompletedActivity {
  activityID: number;
  timestamp: number;
  uid: string;
}

export interface IReward {
  name: string;
  imgpath: string;
  valuePoints: number;
  createdBy: string; // uid of user
  createdAt: number;
  type: any;
  description: string;
  validity: number; // in hours
  rewardFor: IRewardReceiver;
  id?: string;
  progress?: number;
}

export interface IRedeemedReward {
  uid: string,
  rewardID: string,
  timestamp: number,
  referenceID: any;
}

