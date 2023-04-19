import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { SnackbarService } from '@app/services/snackbar.service';
import { CLOUD_FUNCTIONS } from '@shared/Constants/CLOUD_FUNCTIONS';
import { RazorPayOrder } from '@shared/interfaces/order.model';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FunctionsApiService {

  constructor(
    private ngFirebaseFunctions: AngularFireFunctions,
    private snackbarService: SnackbarService
  ) { }

  createTeam(data: any): Promise<any> {
    if (data) {
      const callable = this.ngFirebaseFunctions.httpsCallable(CLOUD_FUNCTIONS.CREATE_TEAM);
      return callable(data)
        .pipe(this.handleError.bind(this))
        .toPromise();
    }
  }

  generateOrder(data: any): Promise<Partial<RazorPayOrder>> {
    if (data) {
      const callable = this.ngFirebaseFunctions.httpsCallable(CLOUD_FUNCTIONS.GENERATE_RAZORPAY_ORDER);
      return callable(data)
        .pipe(this.handleError.bind(this))
        .toPromise();
    }
  }

  generateNewOrder(data: any): Promise<Partial<RazorPayOrder>> {
    if (data) {
      const callable = this.ngFirebaseFunctions.httpsCallable(CLOUD_FUNCTIONS.GENERATE_NEW_RAZORPAY_ORDER);
      return callable(data)
        .pipe(this.handleError.bind(this))
        .toPromise();
    }
  }

  handleError(source: Observable<any>): Observable<any> {
    return source.pipe(
      catchError((error) => {
        this.snackbarService.displayError(error)
        return of(null);
      })
    );
  }
}
