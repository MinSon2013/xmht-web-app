import { Component, } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IMAGEOBJECTS, IMAGEPRODUCTS } from '../mock-data/dashboard.data';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  readonly imageObjects = IMAGEOBJECTS;
  readonly imageProducts: any[] = IMAGEPRODUCTS;
  showDetail: boolean = false;
  desciption: string = '';

  constructor(public translate: TranslateService,) { }

  ngOnInit() { }

  onShowDetail() {
    this.showDetail = !this.showDetail;
    const div = document.getElementById("introDetail");
    if (this.showDetail) {
      if (div) {
        div.style.display = "block";
      }
    } else {
      if (div) {
        div.style.display = "none";
      }
    }
  }

  imageClickHandler(index: number | any) {
    console.log(index)
    const ele = document.getElementById("desciption");
    this.desciption = this.imageProducts[index].desciption;
    if (ele && this.desciption.length > 0) {
      ele.style.display = "block";
    } else if (ele) {
      this.desciption = '';
      ele.style.display = "none";
    }
  }

  onHidden() {
    const ele = document.getElementById("desciption");
    if (ele) {
      ele.style.display = "none";
    }
  }
}
