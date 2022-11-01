import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  URL_AUTH,
  URL_COUNTRIES,
  URL_STATES,
  URL_CITIES,
  API_TOKEN,
  USER_EMAIL,
} from '@shared/Constants/UNIVERSAL_TUTORIAL';

@Injectable({
  providedIn: 'root'
})
export class LocationCitiesService implements OnDestroy {
  private URL_AUTH = URL_AUTH;
  private URL_COUNTRIES = URL_COUNTRIES;
  private URL_STATES = URL_STATES;
  private URL_CITIES = URL_CITIES;
  private API_TOKEN = API_TOKEN;
  private USER_EMAIL = USER_EMAIL;
  subscriptions = new Subscription();

  getAuthToken(): Observable<any> {
    return this.http.get(this.URL_AUTH, {
      headers: {
        Accept: 'application/json',
        'api-token': this.API_TOKEN,
        'user-email': this.USER_EMAIL,
      },
    });
  }
  getCountry(): Observable<string[]> {
    return this.getAuthToken().pipe(
      switchMap((res) => this.http.get(this.URL_COUNTRIES, {
        headers: {
          Authorization: `Bearer ${res.auth_token}`,
          Accept: 'application/json',
        },
      })),
      map((resp) =>
        (Object.values(resp) as Array<{}>).map((val: any) => val.country_name)
      )
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
      map((resp) =>
        (Object.values(resp) as Array<{}>).map((val: any) => val.state_name)
      )
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
      map((resp) =>
        (Object.values(resp) as Array<{}>).map((val: any) => val.city_name)
      )
    );
  }
  constructor(private http: HttpClient) {
    // console.log('location service started');
  }
  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
}
