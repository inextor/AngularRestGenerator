import { Component, OnInit } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { SearchObject } from '../../services/ObjRest';
import { Router,ActivatedRoute } from "@angular/router"
import { BaseComponent } from '../base/base.component';
import { Location } from	'@angular/common';
import { forkJoin } from 'rxjs';
import { of } from 'rxjs';
import { Title } from '@angular/platform-browser';

TEMPLATE_MODEL_IMPORTS

@Component({
	selector: 'app-TABLE_NAME_DASH',
	templateUrl: './list-TABLE_NAME_DASH.component.html',
	styleUrls: ['./list-TABLE_NAME_DASH.component.css']
})

export class ListTABLE_NAME_CAMEL_CASE_UPPERCASEComponent extends BaseComponent implements OnInit {

	TABLE_NAME_list:TABLE_NAME_SNAKE_CASE_UPPERCASE[] = [];

	FORK_JOINS_DECLARATION_LIST

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
				gt: {},
				ge: {},
				le: {},
				lt: {},
				lk: {},
				csv: {},
			};


			this.TABLE_NAME_search.limit = this.pageSize;

			this.titleService.setTitle('TABLE_NAME');

			TEMPLATE_SEARCH_PARAMS

			console.log('Search', this.TABLE_NAME_search);

			let rjoinObj:any = {};
			let fjarray = [];


			this.is_loading = true;
			this.TABLE_NAME_search.page =  'page' in params ? parseInt( params.page ) : 0;
			this.currentPage = this.TABLE_NAME_search.page;

			FORK_JOINS_LIST

		});
	}

	search()
	{
		this.is_loading = true;
		this.TABLE_NAME_search.page = 0;

        let search = {};
        let array = ['eq','le','lt','ge','gt','csv','lk'];
        for(let i in this.TABLE_NAME_search )
        {
            console.log( 'i',i,array.indexOf( i ) );
            if(array.indexOf( i ) > -1 )
            {
                for(let j in this.TABLE_NAME_search[i])
                    search[i+'.'+j] = this.TABLE_NAME_search[i][j];
            }
        }

		console.log( search );
		this.router.navigate(['/list-TABLE_NAME_DASH'],{queryParams: search});
	}
}
