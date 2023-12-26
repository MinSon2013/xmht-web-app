import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Helper } from '../helpers/helper';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss']
})
export class BodyComponent implements OnInit {
  helper = new Helper();

  constructor(private cdr: ChangeDetectorRef) { }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  ngOnInit(): void { }

}
