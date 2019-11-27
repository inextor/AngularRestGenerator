import { Component, OnInit } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { SNAKE_CASE_UPPERCASE } from '../../models/Modelos';
import { Router,ActivatedRoute } from "@angular/router"
import { BaseComponent } from '../base/base.component';
import { Location } from	'@angular/common';
import { SearchObject } from '../../models/Respuestas';
import { forkJoin } from 'rxjs';
import { of } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Component({
	selector: 'app-DASH_TABLE_NAME',
	templateUrl: './list-DASH_TABLE_NAME.component.html',
	styleUrls: ['./list-DASH_TABLE_NAME.component.css']
})

export class TABLE_NAME_CAMEL_CASEComponent extends BaseComponent implements OnInit {

	TABLE_NAMEs:SNAKE_CASE_UPPERCASE[] = [];
	{{table_constraints_arrays}}

	TABLE_NAME_search:SearchObject<SNAKE_CASE_UPPERCASE> = {

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
			this.TABLE_NAME_search.pagina = this.params.get('pagina') ? parseInt( this.params.get('pagina') ) ? 0;

			forkJoin([
					this.rest.TABLE_NAME.search( TABLE_NAME_search ),
					{{table_fork_rests}}
			]).subscribe((result)=>
			{
				this.setPages( this.TABLE_NAME_search.pagina, result[0].total );
				{{table_constraints_arrays_assigns}}
			},error=>
			{
				this.showError( error );
			});
		});
	}

	search()
	{
		this.is_loading = true;
		this.TABLE_NAME_search.pagina = 0;
		this.router.navigate(['/list-TABLE_DASH_NAME',{queryParams: this.TABLE_NAME_search });
	}
}
