import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@admin/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  readonly ALLOWED_METHODS = ['POST', 'PUT', 'DELETE'];
  constructor(private authService: AuthService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    if (token && this.ALLOWED_METHODS.includes(request.method)) {
      const authRequest = request.clone({
        params: new HttpParams().set('auth', this.authService.getToken())
      });
      return next.handle(authRequest);
    }
    return next.handle(request);
  }
}
