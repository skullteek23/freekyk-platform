import { MatchConstants } from "@shared/constants/constants";

export interface IPendingFeedback {
  uid: string;
  itemHeading: string;
  itemDesc: string;
  itemID: string;
  createdAt: number,
  id?: string;
}

export interface IFeedback {
  rating: number,
  timestamp: number,
  itemID: string,
  uid: string,
  id?: string;
}

export interface IFeedbackReason {
  reasons?: any;
  details?: string;
  id?: string; // always same as IFeedback ID always
}

export enum IssueCategory {
  ground,
  equipment,
  safety,
  quality,
  organizer,
  payment,
}

export const IssueCategoryHeading = [
  'Ground Quality',
  'Equipment & Gears',
  'Player Safety',
  'Game Quality',
  'Organizer related Issues',
  'Payment Issues',
]

export enum FeedbackIssues {
  unevenSurface,
  softSurface,
  poorDrainage,
  overgrownGrass,
  artificialTurfGrass,
  debrisOnField,
  inadequateLighting,
  inflatedBalls,
  slipperySurface,
  irregularBall,
  poorVisibility,
  inconsistentBallWeight,
  substandardBalls,
  dangerTackles,
  fightPlayers,
  sprains,
  overuseInjuries,
  fractures,
  concussions,
  heatIllness,
  collisions,
  inadequateProtectiveGear,
  adverseWeather,
  lackFairPlay,
  lateComers,
  unmatchedExperience,
  unfriendlyBehavior,
  frequentStoppages,
  poorSportsmanship,
  delayedStart,
  earlyStop,
  entryIssues,
  incorrectInfo,
  inadequateFacilities,
  poorCommunication,
  unclearRules,
  unableToPay,
  highPrices,
  inadequatePaymentOptions,
  unableToRefund,
  lackTransparency,
  hiddenExpenses,
  accountingDiscrepancies
}

export const FeedbackReasonsHighlights = [
  { value: FeedbackIssues.unevenSurface, viewValue: 'Uneven Surface' },
  { value: FeedbackIssues.delayedStart, viewValue: 'Delayed Start' },
  { value: FeedbackIssues.lackFairPlay, viewValue: 'Lack of Fair Play' },
  { value: FeedbackIssues.dangerTackles, viewValue: 'Dangerous Tackles' },
  { value: FeedbackIssues.inflatedBalls, viewValue: 'Deflated or Overinflated Balls' },
  { value: FeedbackIssues.unableToPay, viewValue: 'Unable to make payment' }
]

export const FeedbackReasons = {
  [IssueCategory.ground]: [
    { value: FeedbackIssues.unevenSurface, viewValue: 'Uneven Surface' },
    { value: FeedbackIssues.softSurface, viewValue: 'Hard or Soft Surface' },
    { value: FeedbackIssues.poorDrainage, viewValue: 'Poor Drainage' },
    { value: FeedbackIssues.overgrownGrass, viewValue: 'Overgrown Grass' },
    { value: FeedbackIssues.artificialTurfGrass, viewValue: 'Artificial Turf Issues' },
    { value: FeedbackIssues.debrisOnField, viewValue: 'Debris on field' },
    { value: FeedbackIssues.inadequateLighting, viewValue: 'Inadequate Lighting ' },
  ],
  [IssueCategory.equipment]: [
    { value: FeedbackIssues.inflatedBalls, viewValue: 'Deflated or Overinflated Balls' },
    { value: FeedbackIssues.slipperySurface, viewValue: 'Poor Grp or Slippery Surface' },
    { value: FeedbackIssues.irregularBall, viewValue: 'Irregular Ball Shape' },
    { value: FeedbackIssues.poorVisibility, viewValue: 'Poor Visibility' },
    { value: FeedbackIssues.inconsistentBallWeight, viewValue: 'Inconsistent Ball Weight' },
    { value: FeedbackIssues.substandardBalls, viewValue: 'Substandard Balls ' },
  ],
  [IssueCategory.safety]: [
    { value: FeedbackIssues.dangerTackles, viewValue: 'Dangerous Tackles' },
    { value: FeedbackIssues.fightPlayers, viewValue: 'Fight with other players' },
    { value: FeedbackIssues.sprains, viewValue: 'Sprains and Strains' },
    { value: FeedbackIssues.overuseInjuries, viewValue: 'Overuse Injuries' },
    { value: FeedbackIssues.fractures, viewValue: 'Fractures and Dislocations' },
    { value: FeedbackIssues.concussions, viewValue: 'Concussions' },
    { value: FeedbackIssues.heatIllness, viewValue: 'Heat-related Illnesses' },
    { value: FeedbackIssues.collisions, viewValue: 'Collisions' },
    { value: FeedbackIssues.inadequateProtectiveGear, viewValue: 'Inadequate Protective Gear' },
    { value: FeedbackIssues.adverseWeather, viewValue: 'Adverse Weather Conditions ' },
  ],
  [IssueCategory.quality]: [
    { value: FeedbackIssues.lackFairPlay, viewValue: 'Lack of Fair Play' },
    { value: FeedbackIssues.lateComers, viewValue: 'Late comers' },
    { value: FeedbackIssues.unmatchedExperience, viewValue: 'Unmatched Experience' },
    { value: FeedbackIssues.unfriendlyBehavior, viewValue: 'Unfriendly behavior' },
    { value: FeedbackIssues.frequentStoppages, viewValue: 'Frequent Stoppages' },
    { value: FeedbackIssues.poorSportsmanship, viewValue: 'Poor Sportsmanship ' },
  ],
  [IssueCategory.organizer]: [
    { value: FeedbackIssues.delayedStart, viewValue: 'Delayed Start' },
    { value: FeedbackIssues.earlyStop, viewValue: 'Early Stop' },
    { value: FeedbackIssues.entryIssues, viewValue: 'Entry Issues' },
    { value: FeedbackIssues.incorrectInfo, viewValue: 'Incorrect information' },
    { value: FeedbackIssues.inadequateFacilities, viewValue: 'Inadequate Facilities' },
    { value: FeedbackIssues.poorCommunication, viewValue: 'Poor Communication' },
    { value: FeedbackIssues.unclearRules, viewValue: 'Unclear Rules and Regulations' },
  ],
  [IssueCategory.payment]: [
    { value: FeedbackIssues.unableToPay, viewValue: 'Unable to make payment' },
    { value: FeedbackIssues.highPrices, viewValue: 'Very high prices' },
    { value: FeedbackIssues.inadequatePaymentOptions, viewValue: 'Inadequate Payment Options' },
    { value: FeedbackIssues.unableToRefund, viewValue: 'Unable to Refund' },
    { value: FeedbackIssues.lackTransparency, viewValue: 'Lack of Transparency' },
    { value: FeedbackIssues.hiddenExpenses, viewValue: 'Hidden expenses on field' },
    { value: FeedbackIssues.accountingDiscrepancies, viewValue: 'Accounting discrepancies' },
  ]
}


export const FeedbackFormatters = {
  formatIssueHeading: (val: string) => {
    return IssueCategoryHeading[val] || 'Others';
  }
}
