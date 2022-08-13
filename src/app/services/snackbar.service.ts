import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  complete = 'Successfully completed!';
  delete = 'Successfully deleted!';
  applied = 'Successfully applied!';
  sent = 'Successfully sent!';
  error = 'Error occured! Please try again later.';
  wait = 'Please wait..';
  displayComplete(): void {
    this.matSnack.open(this.complete, 'OK', {
      duration: 2000,
      panelClass: ['primary-snackbar'],
    });
  }
  displayDelete(): void {
    this.matSnack.open(this.delete, 'OK', {
      duration: 2000,
      panelClass: ['primary-snackbar'],
    });
  }
  displaySent(): void {
    this.matSnack.open(this.sent, 'OK', {
      duration: 2000,
      panelClass: ['primary-snackbar'],
    });
  }
  displayApplied(): void {
    this.matSnack.open(this.applied, 'OK', {
      duration: 2000,
      panelClass: ['primary-snackbar'],
    });
  }
  displayError(): void {
    this.matSnack.open(this.error, 'OK', {
      duration: 2000,
      panelClass: ['warn-snackbar'],
    });
  }
  displayWait(): void {
    this.matSnack.open(this.wait, 'OK', {
      duration: 1000,
      panelClass: ['primary-snackbar'],
    });
  }
  displayCustomMsg(msg: string): void {
    this.matSnack.open(msg, 'OK', {
      duration: 2000,
      panelClass: ['primary-snackbar'],
    });
  }
  displayCustomMsgLong(msg: string): void {
    this.matSnack.open(msg, 'OK', {
      duration: 4000,
      panelClass: ['primary-snackbar'],
    });
  }
  constructor(private matSnack: MatSnackBar) {}
}
