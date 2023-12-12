import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import * as FileSaver from "file-saver";
import { environment } from "../../environments/environment";
import { CONFIG } from "../common/config";
import { Helper } from "../helpers/helper";

@Injectable({
    providedIn: 'root'
})

export class WebRequestService {
    readonly baseUrl: string;
    helper = new Helper();
    httpOptions = {
        headers: new HttpHeaders({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT',
            // 'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Access-Control-Allow-Headers': 'X-Requested-With,content-type',
            'Access-Control-Allow-Credentials': 'true',
            'Authorization': this.helper.getAccessToken(),
        })
    };

    constructor(private http: HttpClient) {
        this.baseUrl = environment.apiUrl;
    }

    get(url: string) {
        return this.http.get(`${this.baseUrl}/${url}`, this.httpOptions);
    }

    post(url: string, payload?: Object) {
        return this.http.post(`${this.baseUrl}/${url}`, payload, this.httpOptions);
    }

    put(url: string, payload?: Object) {
        return this.http.put(`${this.baseUrl}/${url}`, payload, this.httpOptions);
    }

    delete(url: string) {
        return this.http.delete(`${this.baseUrl}/${url}`, this.httpOptions);
    }

    deleteAll(url: string, payload?: Object) {
        return this.http.put(`${this.baseUrl}/${url}`, payload, this.httpOptions);
    }

    login(username: string, password: string) {
        return this.http.post(`${this.baseUrl}/${CONFIG.URL.LOGIN}`, {
            username,
            password
        }, {
            observe: 'response'
        });
    }

    upload(url: string, obj: any) {
        let formData = new FormData();
        formData.append('file', obj.file, obj.fileName);
        return this.http.post(`${this.baseUrl}/${url}`, formData, this.httpOptions);
    }

    download(url: string) {
        FileSaver.saveAs(`${this.baseUrl}/${url}`);
        return this.http.get(`${this.baseUrl}/${url}`, this.httpOptions);
    }
}