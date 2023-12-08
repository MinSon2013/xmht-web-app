import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { WebRequestService } from './web-request.service';
import { Router } from '@angular/router';
import { shareReplay, tap } from 'rxjs/operators';


@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private webService: WebRequestService, private router: Router, private http: HttpClient) { }

    login(username: string, password: string) {
        return this.webService.login(username, password).pipe(
            shareReplay(),
            tap((res: HttpResponse<any>) => {
                // the auth tokens will be in the header of this response
                if (res && res.headers && res.headers.get('accessToken')) {
                    console.log("LOGGED IN!");
                }
            })
        )
    }

    logout() {
        this.removeSession();
        this.router.navigate(['/login']);
    }

    getAccessToken() {
        return localStorage.getItem('accessToken');
    }

    getRefreshToken() {
        return localStorage.getItem('x-refresh-token');
    }

    getUserId() {
        return localStorage.getItem('user-id');
    }

    setAccessToken(accessToken: string) {
        localStorage.setItem('accessToken', accessToken)
    }

    private setSession(userId: string, accessToken: string, refreshToken: string) {
        localStorage.setItem('user-id', userId);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('x-refresh-token', refreshToken);
    }

    private removeSession() {
        localStorage.removeItem('user-id');
        localStorage.removeItem('x-access-token');
        localStorage.removeItem('x-refresh-token');
    }

}