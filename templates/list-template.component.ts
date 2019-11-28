import { Component, OnInit } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { SearchObject } from '../../services/ObjRest';
import { TABLE_NAME_SNAKE_CASE_UPPERCASE } from '../../models/RestModels';
import { Router,ActivatedRoute } from "@angular/router"
import { BaseComponent } from '../base/base.component';
import { Location } from	'@angular/common';
import { forkJoin } from 'rxjs';
import { of } from 'rxjs';
import { Title } from '@angular/platform-browser';
FORK_JOIN_IMPORTS

@Component({
	selector: 'app-TABLE_NAME_DASH',
	templateUrl: './list-TABLE_NAME_DASH.component.html',
	styleUrls: ['./list-TABLE_NAME_DASH.component.css']
})

export class ListTABLE_NAME_CAMEL_CASEComponent extends BaseComponent implements OnInit {

	TABLE_NAMEs:TABLE_NAME_SNAKE_CASE_UPPERCASE[] = [];
	FORK_JOIN_DECLARATION

	TABLE_NAME_search:SearchObject<TABLE_NAME_SNAKE_CASE_UPPERCASE> = {

	};

	constructor( public rest:RestService, public router:Router, public route:ActivatedRoute, public location: Location, public titleService:Title)
	{
		super( rest,router,route,location,titleService);
	}

	ngOnInit()
	{
		this.route.queryParams.subscribe( params =>
		{

			this.TABLE_NAME_search = {
				eq: {},
				ge: {},
				le: {}
			};

			this.titleService.setTitle('TABLE_NAME');


			TABLE_SEARCH_PARAMS

			console.log('Search', this.TABLE_NAME_search);

			let rjoinObj:any = {};
			let fjarray = [];


			this.is_loading = true;
			this.TABLE_NAME_search.page = params.get('page') ? parseInt( params.get('page') ) : 0;

			//forkJoin([
					this.rest.TABLE_NAME.search( this.TABLE_NAME_search )
			//		{{table_fork_rests}}
			//])
			.subscribe((result)=>
			{
				this.setPages( this.TABLE_NAME_search.page, result[0].total );
				//{{table_constraints_arrays_assigns}}
			},error=>
			{
				this.showError( error );
			});
		});
	}

	search()
	{
		this.is_loading = true;
		this.TABLE_NAME_search.page = 0;
		this.router.navigate(['/list-TABLE_NAME_DASH',{queryParams: this.TABLE_NAME_search }]);
	}
}
