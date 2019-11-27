import { Component, OnInit } from '@angular/core';
import { RestService } from '../../services/rest.service';
import {Router,ActivatedRoute} from "@angular/router";
import { Tipo_Precio, Usuario } from '../../models/Modelos';

@Component({
	selector: 'app-{{dash_table_name}}',
	templateUrl: './{{dash_table_name}}.component.html',
	styleUrls: ['./{{dash_table_name}}.component.css']
})
export class AgregarTipoPrecioComponent implements OnInit {

	{{table_name}}:{{camel_case_uppercase}} = {
		nombre: '',
		id_organizacion: null,
	};


	ngOnInit()
	{
		this.route.paramMap.subscribe( params =>
		{
			let id = params.get('id') ==null ? null : parseInt(params.get('id') );

			if( id != null )
			{
				this.is_loading = true;
				this.rest.{{table_name}}.get( id ).subscribe(({{table_name}})=>
				{
					this.is_loading = false;
					this.{{table_name}} = {{table_name}};
				}, (error) =>
				{
					this.showError(error);
					this.is_loading = false;
				});
			}
		});
	}

	save()
	{
		this.is_loading = true;

		if( this.{{table_name}}.id	)
		{
			this.rest.{{table_name}}.update( this.{{table_name}} ).subscribe(({{table_name}})=>{
				this.is_loading = false;
				this.router.navigate(['/{{dash_table_name}}']);
			});
		}
		else
		{
			this.rest.tipo_precio.create( this.tipoPrecio ).subscribe((tipoPrecio)=>{
				this.is_loading = false;
				this.router.navigate(['/{{dash_table_name}}']);
			});
		}
	}
}
