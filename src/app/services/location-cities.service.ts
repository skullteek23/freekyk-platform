import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class LocationCitiesService implements OnDestroy {
  private URL_AUTH = 'https://www.universal-tutorial.com/api/getaccesstoken';
  private URL_COUNTRIES = 'https://www.universal-tutorial.com/api/countries/';
  private URL_STATES = 'https://www.universal-tutorial.com/api/states/';
  private URL_CITIES = 'https://www.universal-tutorial.com/api/cities/';
  private API_TOKEN =
    'rBvTqnFug52VojoavuiXTidP55cANzztlxJhNMYn0BMCUxVKD7EjWR_L7JQyY4xh7oo';
  private USER_EMAIL = 'pgoel681@gmail.com';
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
      switchMap((res) => {
        return this.http.get(this.URL_COUNTRIES, {
          headers: {
            Authorization: `Bearer ${res.auth_token}`,
            Accept: 'application/json',
          },
        });
      }),
      map((resp) =>
        (Object.values(resp) as Array<{}>).map((val: any) => val.country_name)
      )
    );
  }
  getStateByCountry(country: string = 'India'): Observable<string[]> {
    return this.getAuthToken().pipe(
      switchMap((res) => {
        return this.http.get(this.URL_STATES + country, {
          headers: {
            Authorization: `Bearer ${res.auth_token}`,
            Accept: 'application/json',
          },
        });
      }),
      map((resp) =>
        (Object.values(resp) as Array<{}>).map((val: any) => val.state_name)
      )
    );
  }
  getCityByState(state: string): Observable<string[]> {
    return this.getAuthToken().pipe(
      switchMap((res) => {
        return this.http.get(this.URL_CITIES + state, {
          headers: {
            Authorization: `Bearer ${res.auth_token}`,
            Accept: 'application/json',
          },
        });
      }),
      map((resp) =>
        (Object.values(resp) as Array<{}>).map((val: any) => val.city_name)
      )
    );
  }
  constructor(private http: HttpClient) {
    console.log('location service started');
  }
  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
}
