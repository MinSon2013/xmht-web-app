import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Helper } from '../helpers/helper';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss']
})
export class BodyComponent implements OnInit {
  // @Input() collapsed = false;
  // @Input() screenWidth = 0;
  helper = new Helper();

  constructor(private cdr: ChangeDetectorRef) { }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  ngOnInit(): void { }

  // getBodyClass(): string {
  //   let styleClass = '';
  //   let element = document.getElementById('app-sidenav');
  //   if (element) {
  //     if (this.collapsed && this.screenWidth > 768) {
  //       styleClass = 'body-trimmed';
  //     } else if (this.collapsed
  //       && this.screenWidth <= 768
  //       && this.screenWidth > 0) {
  //       styleClass = 'body-md-screen';
  //     }
  //   }
  //   return styleClass;
  // }
}
