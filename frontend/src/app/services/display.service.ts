import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class DisplayService {

    public constructor() {
        this.showNavigation$ = this.showNavigation.asObservable();
    }
    public showNavigation$: Observable<boolean>;

    private showNavigation: Subject<boolean> = new Subject<boolean>();

    public setNavigationVisibility(visible: boolean): void {
        this.showNavigation.next(visible);
    }
}