import { Component, OnInit } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { {{TABLE_NAME_MODEL}} } from '../../models/Modelos';
import { SearchCitaResponse,SearchCitaRequest } from '../../models/Respuestas';
import {Router,ActivatedRoute} from "@angular/router"
import { Cita,Centro_Medico } from '../../models/Modelos';
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

	cita_search:SearchObject<Cita> = {

	};

	constructor( public rest:RestService, public router:Router, public route:ActivatedRoute, public location: Location, public titleService:Title)
	{
		super( rest,router,route,location,titleService);
	}

	ngOnInit()
	{
		this.route.queryParams.subscribe( params =>
		{

			this.{{table_name}} = {
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

			//this.cita_search.eq.id_paciente ? this.rest.paciente.get( this.cita_search.eq.id_paciente ) : of(null)
			forkJoin([
					this.rest.{{table_name}}.search( {{table_name}}_search ),
					{{table_fork_rests}}
			]).subscribe((result)=>
			{
				this.setPages( this.{{table_name}}_search.pagina, result[0].total );

				{{table_constraints_arrays_assigns}}
				//this.centros_medicos = result[2].datos;
				//this.info_citas = result[3].datos;
			},error=>
			{
				console.log( error );
				this.showError( error );
			});
		});
	}

	search()
	{
		this.is_loading = true;
		this.{{table_name}}_search.pagina = 0;
		this.router.navigate(['/{{table_name}}',{queryParams: this.{{table_name}}search );
	}
}
