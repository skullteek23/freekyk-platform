import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OnboardUserGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.isLoggedIn()
      .pipe(switchMap(async user => {
        const callbackUrl = state.url;
        const encodedCallbackUrl = encodeURIComponent(callbackUrl);
        if (user) {
          const result = await this.authService.isProfileExists(user);
          if (result) {
            return true;
          } else {
            this.router.navigate(['/onboarding'], { queryParams: { callback: encodedCallbackUrl } })
            return false;
          }
        } else {
          // Player is not logged in, redirect to signup
          this.router.navigate(['/signup'], { queryParams: { callback: encodedCallbackUrl } });
          return false;
        }
      }))
  }

}
