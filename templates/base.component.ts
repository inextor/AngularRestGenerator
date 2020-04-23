import { Component, OnInit } from '@angular/core';
import { RestService,ErrorMessage } from '../../services/rest.service';
import { Router,ActivatedRoute,Params} from "@angular/router"
import { Location } from	'@angular/common';
import { LoadingComponent } from '../../components/loading/loading.component';
import { HttpErrorResponse } from '@angular/common/http';
import { combineLatest } from 'rxjs';
import { Observable } from 'rxjs';
import { forkJoin,of } from 'rxjs';
import { mergeMap,catchError } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';


@Component({
	selector: 'app-base',
	templateUrl: './base.component.html',
	styleUrls: ['./base.component.css']
})

export class BaseComponent implements OnInit {

	public is_loading:boolean	= false;
	public totalPages:number	= 0;
	public totalItems: number 	= 0;
	public currentPage:number	= 0;
	public pages:number[]		= [];
	public pageSize:number		= 10;

	public error_message:string		= null;
	public success_message:string	= null;
	public warning_message:string	= null;

	constructor(public rest: RestService, public router: Router, public route: ActivatedRoute, public location: Location, public titleService: Title)
	{
		//super( rest,router,route,location,titleService);
		this.rest.hideMenu();
	}

	ngOnInit() {
	}

	setPages(currentPage:number,totalItems:number)
	{
		this.currentPage = currentPage;
		this.pages.splice(0,this.pages.length);
		this.totalItems = totalItems;

		if( ( this.totalItems % this.pageSize ) > 0 )
		{
			this.totalPages = Math.floor(this.totalItems/this.pageSize)+1;
		}
		else
		{
			this.totalPages = this.totalItems/this.pageSize;
		}

		for(let i=this.currentPage-5;i<this.currentPage+5;i++)
		{
			if( i >= 0 && i<this.totalPages)
			{
				this.pages.push( i );
			}
		}

		this.is_loading = false;
		this.rest.scrollTop();
	}

	showSuccess(str:string):void
	{
		this.rest.showErrorMessage(new ErrorMessage( str,'alert-success' ));
	}

	showError(error:any):void {
		this.is_loading = false;
		this.rest.showError(error);
	}

	public setTitle(newTitle: string) {
		this.titleService.setTitle(newTitle);
	}
}
