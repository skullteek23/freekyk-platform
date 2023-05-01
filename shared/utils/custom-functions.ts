import { AbstractControl, FormGroup, ValidatorFn } from "@angular/forms";
import { ProfileConstants } from "@shared/constants/constants";

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
