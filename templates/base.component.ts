import { Component, OnInit } from '@angular/core';
import { RestService } from '../../services/rest.service';
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
		//	super( rest,router,route,location,titleService);
	}

	setPages(currentPage:number,totalItems:number)
	{
		this.currentPage = currentPage;
		this.pages.splice(0,this.pages.length);
		this.totalItems = totalItems;

		console.log('Calculo con el pie derecho',this.totalPages, this.totalItems,  (this.totalPages % this.totalItems) );
		if( ( this.totalItems % this.pageSize ) > 0 )
		{
			this.totalPages = Math.floor(this.totalItems/this.pageSize)+1;
			console.log('First');
		}
		else
		{
			console.log('Second');
			this.totalPages = this.totalItems/this.pageSize;
		}

		console.log('TOTAL Pages',this.totalPages,'current',this.currentPage,'total items',this.totalItems );

		for(let i=this.currentPage-5;i<this.currentPage+5;i++)
		{
			if( i >= 0 && i<this.totalPages)
			{
				this.pages.push( i );
			}
		}
		console.log( this.pages );
	}

	ngOnInit() {
		//this.rest.getNetworkMonitor().subscribe((is_loading)=>
	}

	showError(error:any) {
		this.is_loading	= false;
		let str_error	= this.getErrorMessage( error );
		//Do something
		//this.rest.showError({ mensaje: str_error, tipo:'alert-danger' });
	}

	getErrorMessage( error:any )
	{
		if( error == null || error === undefined)
			return 'Error desconocido';



		if( typeof error === "string" )
			return error;

		if( 'error' in error )
		{
			if( typeof( error.error ) === "string" )
				return error.error;

			console.log('Test ',error.error );

			if( error.error && 'error' in error.error &&  typeof(error.error.error ) === "string" )
			{
				 return error.error.error;
			}
		}
		if( error instanceof HttpErrorResponse )
		{
			return error.statusText;
		}
		else
		{
			return 'Error desconocido';
		}
	}

	public setTitle(newTitle: string) {
		this.titleService.setTitle(newTitle);
	}
}
