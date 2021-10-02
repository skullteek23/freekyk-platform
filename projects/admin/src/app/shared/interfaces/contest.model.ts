import { Timestamp } from '@firebase/firestore-types';
export interface ContestBasicInfo {
  id: string;
  imgpath: string;
  name: string;
  start_date: Timestamp;
  end_date: Timestamp;
  fees: number;
}
export interface ContestDescription {
  rules: string;
  prizes: { first: string; second: string; third: string };
  brands: { name: string; imgpath: string }[];
  scoreCnt: string;
}
export interface ContestStats {
  winner1: {
    id: string;
    name: string;
    imgpath: string;
  };
  winner2: {
    id: string;
    name: string;
    imgpath: string;
  };
  winner3: {
    id: string;
    name: string;
    imgpath: string;
  };
}
export interface ContestSubmission {
  uid: string;
  name: string;
  nickname: string;
  locCountry: string;
  age: number;
  subm: string;
  appr: 'A' | 'U' | 'W';
}
