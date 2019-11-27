import { Component, OnInit } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { {{TABLE_NAME_MODEL}} } from '../../models/Modelos';
import { Router,ActivatedRoute } from "@angular/router"
import { BaseComponent } from '../base/base.component';
import { Location } from	'@angular/common';
import { SearchObject } from '../../models/Respuestas';
import { forkJoin } from 'rxjs';
import { of } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Component({
	selector: 'app-{{dash_table_name}}',
	templateUrl: './{{dash_table_name}}-list.component.html',
	styleUrls: ['./{{dash_table_name}}-list.component.css']
})

export class {TABLE_NAME_CAMEL_CASE}}Component extends BaseComponent implements OnInit {

	{{table_name}}s:{{TABLE_NAME_MODEL}}[] = [];
	{{table_constraints_arrays}}

	{{table_name}}_search:SearchObject<{{camel_case_uppercase}}> = {

	};

	constructor( public rest:RestService, public router:Router, public route:ActivatedRoute, public location: Location, public titleService:Title)
	{
		super( rest,router,route,location,titleService);
	}

	ngOnInit()
	{
		this.route.queryParams.subscribe( params =>
		{

			this.{{table_name}}_search = {
				eq: {},
				ge: {},
				le: {}
			};

			this.titleService.setTitle('{{table_name}}');


			{{table_search_params}}

			console.log('Search', this.{{table_name}}_search);

			let rjoinObj:any = {};
			let fjarray = [];


			this.is_loading = true;
			this.{{table_name}}_search.pagina = this.params.get('pagina') ? parseInt( this.params.get('pagina') ) ? 0;

			forkJoin([
					this.rest.{{table_name}}.search( {{table_name}}_search ),
					{{table_fork_rests}}
			]).subscribe((result)=>
			{
				this.setPages( this.{{table_name}}_search.pagina, result[0].total );
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
		this.{{table_name}}_search.pagina = 0;
		this.router.navigate(['/{{table_name}}',{queryParams: this.{{table_name}}_search });
	}
}
