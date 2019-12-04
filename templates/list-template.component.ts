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
				gt: {},
				ge: {},
				le: {},
				lt: {},
				lk: {},
				csv: {},
			};

			this.titleService.setTitle('TABLE_NAME');

			TABLE_SEARCH_PARAMS

			console.log('Search', this.TABLE_NAME_search);

			let rjoinObj:any = {};
			let fjarray = [];


			this.is_loading = true;
			this.TABLE_NAME_search.page = params.get('page') ? parseInt( params.get('page') ) : 0;

			FORK_JOIN_CONSTRAINTS

		});
	}

	search()
	{
		this.is_loading = true;
		this.TABLE_NAME_search.page = 0;

        let search = {};
        let array = ['eq','le','lt','ge','gt','csv','lk'];
        for(let i in this.venta_search )
        {
            console.log( 'i',i,array.indexOf( i ) );
            if(array.indexOf( i ) > -1 )
            {
                for(let j in this.venta_search[i])
                    search[i+'.'+j] = this.venta_search[i][j];
            }
        }

		this.router.navigate(['/list-TABLE_NAME_DASH'],{queryParams: search});
	}
}
