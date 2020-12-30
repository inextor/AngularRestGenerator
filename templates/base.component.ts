import { Component, OnInit, OnDestroy } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { Router,ActivatedRoute} from "@angular/router" //,Params
import { Location } from	'@angular/common';
import { Title } from '@angular/platform-browser';
import { Preferences } from 'src/app/models/RestModels';
import { SearchObject } from 'src/app/services/Rest';
import { ErrorMessage, StringDictionary } from 'src/app/models/models';
import { SubSink } from 'subsink';

@Component({
	selector: 'app-base',
	templateUrl: './base.component.html',
	styleUrls: ['./base.component.css']
})

export class BaseComponent implements OnInit {

	public is_loading:boolean	= false;
	public preferences:Preferences = {};

	public totalPages:number	= 0;
	public totalItems: number 	= 0;
	public currentPage:number	= 0;
	public pages:number[]		= [];
	public pageSize:number		= 50;
	public path:string 			= '';

	public error_message:string		= null;
	public success_message:string	= null;
	public warning_message:string	= null;
	public subs:SubSink	= new SubSink();

	constructor(public rest: RestService, public router: Router, public route: ActivatedRoute, public location: Location, public titleService: Title)
	{
		//this.rest.hideMenu();
	}
	ngOnInit() { }

	ngOnDestroy()
	{
		console.log('Unsubcribing');
		this.subs.unsubscribe();
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
		//this.rest.scrollTop();
	}

	getSearchExtra(params:any, extra_keys:string[]):StringDictionary<string>
	{
		if(extra_keys== null )
			return {};

		let extra_search:StringDictionary<string> = {};

		extra_keys.forEach(i=>
		{
			if( params[ 'search_extra.'+i ] )
			{
				extra_search[ i ] = params['search_extra.'+i ] === 'null' ? null : params[ 'search_extra.'+i ];
			}
			else
			{
				extra_search[ i ] = null;
			}
		});

		return extra_search;
	}

	getSearchField<T>(params:any, fields:string[]):SearchObject<T>
	{
		let keys = ['eq','le','lt','ge','gt','csv','lk','nn'];

		let item_search:SearchObject<T> = {};

		keys.forEach((k)=>
		{
			item_search[k] ={};
			fields.forEach((f)=>
			{
				let field = k+"."+f;

				if( params[field ] )
				{
					item_search[ k ][ f ] = params[field] === 'null' ? null : params[ field ];
				}
				else
				{
					item_search[ k ][ f ] = null;
				}
			});
		});

		item_search.page = 'page' in params ? parseInt( params['page'] ) : 0;

		if( item_search.page == NaN )
			item_search.page = 0;

		return item_search;
	}

	search(item_search:SearchObject<any> = null ,search_extra:StringDictionary<string>= null )
	{
		item_search.page = 0;

		let search = {};
		let array = ['eq','le','lt','ge','gt','csv','lk','nn'];

		for(let i in item_search )
		{
			console.log( 'i',i,array.indexOf( i ) );
			if(array.indexOf( i ) > -1 )
			{
				for(let j in item_search[i])
					if( item_search[i][j] !== null && item_search[i][j] !== 'null')
						search[i+'.'+j] = item_search[i][j];
			}
		}

		for(let i in search_extra )
		{
			if( search_extra[ i ] !== null && search_extra[ i ] !== 'null' )
				search['search_extra.'+i] =  search_extra[ i ];
		}

		this.router.navigateByUrl('/',{skipLocationChange: true}).then(()=>{
			this.router.navigate([this.path],{queryParams: search});
		});
	}

	showSuccess(str:string):void
	{
		this.rest.showErrorMessage(new ErrorMessage( str,'alert-success' ));
	}

	showError(error:any):void
	{
		this.is_loading = false;
		this.rest.showError(error);
	}

	public setTitle(newTitle: string)
	{
		this.titleService.setTitle(newTitle);
	}
}
