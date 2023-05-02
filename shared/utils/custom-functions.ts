import { AbstractControl, FormGroup, ValidatorFn } from "@angular/forms";
import { IKnockoutData } from "@shared/components/knockout-bracket/knockout-bracket.component";
import { ProfileConstants } from "@shared/constants/constants";
import { MatchFixture } from "@shared/interfaces/match.model";

export function RemoveUnchangedKeysFromFormGroup(form: FormGroup, comparatorObj?: any): any {
  if (!form) {
    return;
  }
  const value = JSON.parse(JSON.stringify(form?.value));
  Object.keys(value).forEach(key => {
    const control = form.get(key);
    if (control && (control.dirty || control.touched) && control.valid && control.value !== '') {
      // The control has been changed, so leave it in the form value object
      if (comparatorObj && comparatorObj.hasOwnProperty(key)) {
        const originalValue = comparatorObj[key];
        if (JSON.stringify(originalValue) === JSON.stringify(value[key])) {
          // The control hasn't been changed, so remove it from the form value object
          delete value[key];
        }
      }
    } else {
      delete value[key];
    }
  });
  return value;
}

export class CustomValidators {
  static minSignupAge(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control?.value;
      if (new Date(value).getTime() >=
        new Date(ProfileConstants.MAX_BIRTH_DATE_ALLOWED).getTime()) {
        return { underAge: true };
      } else {
        return null;
      }
    };
  }
}

export function getFeesAfterDiscount(fees: number, discount: number): number {
  if (fees === 0) {
    return 0;
  }
  return (fees - ((discount / 100) * fees));
}

export function createKnockoutData(matches: MatchFixture[]): IKnockoutData {
  if (matches?.length) {
    const round2matches = matches.filter(el => el.fkcRound === 2);
    const round4matches = matches.filter(el => el.fkcRound === 4);
    const round8matches = matches.filter(el => el.fkcRound === 8);
    const round16matches = matches.filter(el => el.fkcRound === 16);

    const data: Partial<IKnockoutData> = {};
    data.match = round2matches[0];
    if (round4matches.length) {
      data.next = [
        {
          match: round4matches[0]
        },
        {
          match: round4matches[1]
        },
      ]
    }

    if (round8matches.length) {
      data.next[0].next = [
        {
          match: round8matches[0]
        },
        {
          match: round8matches[1]
        },
      ]
      data.next[1].next = [
        {
          match: round8matches[2]
        },
        {
          match: round8matches[3]
        },
      ]
    }

    if (round16matches.length) {
      data.next[0].next[0].next = [
        {
          match: round16matches[0]
        },
        {
          match: round16matches[1]
        },
      ]
      data.next[1].next[0].next = [
        {
          match: round16matches[2]
        },
        {
          match: round16matches[3]
        }
      ]
      data.next[0].next[1].next = [
        {
          match: round16matches[4]
        },
        {
          match: round16matches[5]
        }
      ]
      data.next[1].next[1].next = [
        {
          match: round16matches[6]
        },
        {
          match: round16matches[7]
        }
      ]
    }

    return data as IKnockoutData;
  }
  return null;
}
