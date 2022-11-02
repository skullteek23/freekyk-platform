/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService implements OnDestroy {

  subscriptions = new Subscription();

  private token: string = null;
  private URL_AUTH = 'https://www.universal-tutorial.com/api/getaccesstoken';
  private URL_COUNTRIES = 'https://www.universal-tutorial.com/api/countries/';
  private URL_STATES = 'https://www.universal-tutorial.com/api/states/';
  private URL_CITIES = 'https://www.universal-tutorial.com/api/cities/';
  private API_TOKEN = environment.location.token;
  private USER_EMAIL = environment.location.email;

  constructor(
    private http: HttpClient
  ) { }

  ngOnDestroy(): void {
    this.token = null;
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  getAuthToken(): Observable<any> {
    if (this.token) {
      return of(this.token);
    }
    return this.http.get(this.URL_AUTH, {
      headers: {
        Accept: 'application/json',
        'api-token': this.API_TOKEN,
        'user-email': this.USER_EMAIL,
      },
    }).pipe(tap(res => this.token = res));
  }

  getCountry(): Observable<string[]> {
    return this.getAuthToken().pipe(
      switchMap((res) => this.http.get(this.URL_COUNTRIES, {
        headers: {
          Authorization: `Bearer ${res.auth_token}`,
          Accept: 'application/json',
        },
      })),
      map((resp) => (Object.values(resp) as any[]).map((val: any) => val.country_name))
    );
  }

  getStateByCountry(country: string = 'India'): Observable<string[]> {
    return this.getAuthToken().pipe(
      switchMap((res) => this.http.get(this.URL_STATES + country, {
        headers: {
          Authorization: `Bearer ${res.auth_token}`,
          Accept: 'application/json',
        },
      })),
      map((resp) => (Object.values(resp) as any[]).map((val: any) => val.state_name))
    );
  }

  getCityByState(state: string): Observable<string[]> {
    return this.getAuthToken().pipe(
      switchMap((res) => this.http.get(this.URL_CITIES + state, {
        headers: {
          Authorization: `Bearer ${res.auth_token}`,
          Accept: 'application/json',
        },
      })),
      map((resp) => (Object.values(resp) as any[]).map((val: any) => val.city_name))
    );
  }
}
