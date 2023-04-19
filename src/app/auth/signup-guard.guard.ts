import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SignupGuardGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.isLoggedIn()
      .pipe(switchMap(async user => {
        // queryParams always contains encoded callback Url
        const encodedCallbackUrl = route?.queryParams['callback'] || '/';
        if (user) {
          const result = await this.authService.isProfileExists(user);
          if (result) {
            // Player is onboard, navigate to callback url
            this.router.navigate([decodeURIComponent(encodedCallbackUrl)]);
            return false;
          } else {
            // Player is not onboard, navigate to onboarding screen
            this.router.navigate(['/onboarding'], { queryParams: { callback: encodedCallbackUrl } });
            return false;
          }
        } else {
          // Player is not logged in, continue navigation
          return true;
        }
      }))
  }

}
