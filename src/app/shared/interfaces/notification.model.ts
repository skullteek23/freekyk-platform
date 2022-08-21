import { Timestamp } from '@firebase/firestore-types';
export type TEAM_WELCOME = 'team welcome';
export type REQUEST = 'request';
export type INVITE = 'invite';
export type CHALLENGE = 'team challenge';
export interface NotificationBasic {
  type: TEAM_WELCOME | REQUEST | INVITE | CHALLENGE;
  senderId: string;
  receiverId: string;
  date: Timestamp;
  title: string;
  senderName?: string | null;
  id?: string;
}
export interface Invite {
  teamId: string;
  teamName: string;
  inviteeId: string;
  inviteeName: string;
  status: 'wait' | 'accept' | 'reject';
  id?: string;
}
