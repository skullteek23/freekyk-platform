export type TEAM_WELCOME = 'team welcome';
export type REQUEST = 'request';
export type INVITE = 'invite';
export type CHALLENGE = 'team challenge';
export interface NotificationBasic {
  type: TEAM_WELCOME | REQUEST | INVITE | CHALLENGE;
  senderId: string;
  receiverId: string;
  date: number;
  title: string;
  senderName?: string | null;
  read: boolean;
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
