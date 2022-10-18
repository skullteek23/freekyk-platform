import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { SnackBarComponent } from '../shared/snack-bar/snack-bar.component';

const SNACKBAR_AUTO_HIDE = 5000; // time in milliseconds
const SNACKBAR_HORIZONTAL_POSITION = 'center'; // time in milliseconds
const SNACKBAR_VERTICAL_POSITION = 'bottom'; // time in milliseconds

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {

  constructor(
    private matSnack: MatSnackBar
  ) { }

  displayCustomMsg(message: string, isError = false): void {
    if (message === null || message === '') {
      return;
    }
    const config = new MatSnackBarConfig();
    config.verticalPosition = SNACKBAR_VERTICAL_POSITION;
    config.horizontalPosition = SNACKBAR_HORIZONTAL_POSITION;
    config.duration = SNACKBAR_AUTO_HIDE;
    config.panelClass = isError === false ? ['snack-bar-success'] : ['snack-bar-error'];
    config.data = { 'msg': message };

    this.matSnack.openFromComponent(SnackBarComponent, config);
  }

  displayError(errorMessage?: string): void {
    if (errorMessage === undefined || errorMessage === null || errorMessage === '') {
      errorMessage = 'Error Occurred! Please try again later';
    }
    this.displayCustomMsg(errorMessage, true);
  }

}
